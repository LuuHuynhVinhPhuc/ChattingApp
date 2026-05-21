using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Identity;
using Volo.Abp.Users;
using Volo.Abp;

namespace MessageApp.Chat;

[Authorize]
[RemoteService(false)]
public class ChatAppService : ApplicationService, IChatAppService
{
    private readonly IRepository<ChatChannel, Guid> _channelRepository;
    private readonly IRepository<ChatMessage, Guid> _messageRepository;
    private readonly IRepository<IdentityUser, Guid> _identityUserRepository;
    private readonly IRepository<ChatChannelMember, Guid> _channelMemberRepository;
    private readonly IChatRealtimeService _chatRealtimeService;
    private readonly IChatUserPresenceService _presenceService;

    public ChatAppService(
        IRepository<ChatChannel, Guid> channelRepository,
        IRepository<ChatMessage, Guid> messageRepository,
        IRepository<IdentityUser, Guid> identityUserRepository,
        IRepository<ChatChannelMember, Guid> channelMemberRepository,
        IChatRealtimeService chatRealtimeService,
        IChatUserPresenceService presenceService)
    {
        _channelRepository = channelRepository;
        _messageRepository = messageRepository;
        _identityUserRepository = identityUserRepository;
        _channelMemberRepository = channelMemberRepository;
        _chatRealtimeService = chatRealtimeService;
        _presenceService = presenceService;
    }

    public async Task<List<ChatChannelDto>> GetChannelsAsync()
    {
        var currentUserId = CurrentUser.GetId();
        var publicChannelNames = new[] { "General", "Random", "ABP Framework", "React & Tailwind" };

        var memberChannelIds = (await _channelMemberRepository.GetListAsync(m => m.UserId == currentUserId))
            .Select(m => m.ChannelId)
            .ToList();

        var channels = await _channelRepository.GetListAsync();
        return channels
            .Where(c => publicChannelNames.Contains(c.Name) || memberChannelIds.Contains(c.Id))
            .OrderBy(c => c.Name)
            .Select(c => new ChatChannelDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                CreationTime = c.CreationTime
            })
            .ToList();
    }

    public async Task<ChatChannelDto> CreateChannelAsync(CreateChatChannelDto input)
    {
        var currentUserId = CurrentUser.GetId();
        var channel = new ChatChannel(
            GuidGenerator.Create(),
            input.Name,
            input.Description
        );

        await _channelRepository.InsertAsync(channel);

        var member = new ChatChannelMember(
            GuidGenerator.Create(),
            channel.Id,
            currentUserId
        );
        await _channelMemberRepository.InsertAsync(member);

        return new ChatChannelDto
        {
            Id = channel.Id,
            Name = channel.Name,
            Description = channel.Description,
            CreationTime = channel.CreationTime
        };
    }

    public async Task<List<ChatMessageDto>> GetChannelMessagesAsync(Guid channelId)
    {
        var currentUserId = CurrentUser.GetId();
        var channel = await _channelRepository.GetAsync(channelId);
        var publicChannelNames = new[] { "General", "Random", "ABP Framework", "React & Tailwind" };

        if (!publicChannelNames.Contains(channel.Name))
        {
            var isMember = await _channelMemberRepository.AnyAsync(m => m.ChannelId == channelId && m.UserId == currentUserId);
            if (!isMember)
            {
                throw new UserFriendlyException("You are not a member of this channel.");
            }
        }

        var messages = await _messageRepository.GetListAsync(m => m.ChannelId == channelId);
        var userIds = messages.Select(m => m.SenderId).Distinct().ToList();
        
        var users = await _identityUserRepository.GetListAsync(u => userIds.Contains(u.Id));
        var userMap = users.ToDictionary(u => u.Id, u => u.Name ?? u.UserName);

        return messages
            .OrderBy(m => m.CreationTime)
            .Select(m => new ChatMessageDto
            {
                Id = m.Id,
                SenderId = m.SenderId,
                SenderName = userMap.TryGetValue(m.SenderId, out var name) ? name : "Unknown User",
                ReceiverId = m.ReceiverId,
                ChannelId = m.ChannelId,
                Message = m.Message,
                CreationTime = m.CreationTime
            })
            .ToList();
    }

    public async Task<List<ChatMessageDto>> GetPrivateMessagesAsync(Guid receiverId)
    {
        var currentUserId = CurrentUser.GetId();
        
        // Load messages where (sender is current and receiver is partner) OR (sender is partner and receiver is current)
        var messages = await _messageRepository.GetListAsync(m =>
            (m.SenderId == currentUserId && m.ReceiverId == receiverId) ||
            (m.SenderId == receiverId && m.ReceiverId == currentUserId)
        );

        var userIds = new List<Guid> { currentUserId, receiverId };
        var users = await _identityUserRepository.GetListAsync(u => userIds.Contains(u.Id));
        var userMap = users.ToDictionary(u => u.Id, u => u.Name ?? u.UserName);

        return messages
            .OrderBy(m => m.CreationTime)
            .Select(m => new ChatMessageDto
            {
                Id = m.Id,
                SenderId = m.SenderId,
                SenderName = userMap.TryGetValue(m.SenderId, out var name) ? name : "Unknown User",
                ReceiverId = m.ReceiverId,
                ChannelId = m.ChannelId,
                Message = m.Message,
                CreationTime = m.CreationTime
            })
            .ToList();
    }

    public async Task<List<ChatUserDto>> GetUsersAsync()
    {
        var currentUserId = CurrentUser.GetId();
        var users = await _identityUserRepository.GetListAsync();

        return users
            .Where(u => u.Id != currentUserId)
            .Select(u => new ChatUserDto
            {
                Id = u.Id,
                UserName = u.UserName,
                Name = u.Name ?? u.UserName,
                Email = u.Email,
                IsOnline = _presenceService.IsUserOnline(u.Id)
            })
            .ToList();
    }

    public async Task<ChatMessageDto> SendMessageAsync(SendMessageDto input)
    {
        var senderId = CurrentUser.GetId();
        var sender = await _identityUserRepository.GetAsync(senderId);

        if (input.ChannelId.HasValue)
        {
            var channelId = input.ChannelId.Value;
            var channel = await _channelRepository.GetAsync(channelId);
            var publicChannelNames = new[] { "General", "Random", "ABP Framework", "React & Tailwind" };

            if (!publicChannelNames.Contains(channel.Name))
            {
                var isMember = await _channelMemberRepository.AnyAsync(m => m.ChannelId == channelId && m.UserId == senderId);
                if (!isMember)
                {
                    throw new UserFriendlyException("You are not a member of this channel.");
                }
            }
        }

        var message = new ChatMessage(
            GuidGenerator.Create(),
            senderId,
            input.Message,
            input.ReceiverId,
            input.ChannelId
        );

        await _messageRepository.InsertAsync(message);

        var dto = new ChatMessageDto
        {
            Id = message.Id,
            SenderId = senderId,
            SenderName = sender.Name ?? sender.UserName,
            ReceiverId = message.ReceiverId,
            ChannelId = message.ChannelId,
            Message = message.Message,
            CreationTime = message.CreationTime
        };

        // Notify client real-time
        await _chatRealtimeService.SendMessageAsync(dto);

        return dto;
    }

    public async Task<List<ChatUserDto>> GetChannelMembersAsync(Guid channelId)
    {
        var members = await _channelMemberRepository.GetListAsync(m => m.ChannelId == channelId);
        var userIds = members.Select(m => m.UserId).ToList();

        var users = await _identityUserRepository.GetListAsync(u => userIds.Contains(u.Id));

        return users
            .Select(u => new ChatUserDto
            {
                Id = u.Id,
                UserName = u.UserName,
                Name = u.Name ?? u.UserName,
                Email = u.Email,
                IsOnline = _presenceService.IsUserOnline(u.Id)
            })
            .ToList();
    }

    public async Task<List<ChatUserDto>> GetNonMembersAsync(Guid channelId)
    {
        var members = await _channelMemberRepository.GetListAsync(m => m.ChannelId == channelId);
        var memberUserIds = members.Select(m => m.UserId).ToList();

        var allUsers = await _identityUserRepository.GetListAsync();

        return allUsers
            .Where(u => !memberUserIds.Contains(u.Id))
            .Select(u => new ChatUserDto
            {
                Id = u.Id,
                UserName = u.UserName,
                Name = u.Name ?? u.UserName,
                Email = u.Email,
                IsOnline = _presenceService.IsUserOnline(u.Id)
            })
            .ToList();
    }

    public async Task AddMemberAsync(Guid channelId, Guid userId)
    {
        var exists = await _channelMemberRepository.AnyAsync(m => m.ChannelId == channelId && m.UserId == userId);
        if (exists)
        {
            return;
        }

        var member = new ChatChannelMember(
            GuidGenerator.Create(),
            channelId,
            userId
        );

        await _channelMemberRepository.InsertAsync(member);

        var channel = await _channelRepository.GetAsync(channelId);
        var channelDto = new ChatChannelDto
        {
            Id = channel.Id,
            Name = channel.Name,
            Description = channel.Description,
            CreationTime = channel.CreationTime
        };

        await _chatRealtimeService.SendAddedToChannelAsync(userId, channelDto);
    }

    public async Task RemoveMemberAsync(Guid channelId, Guid userId)
    {
        var member = await _channelMemberRepository.FirstOrDefaultAsync(m => m.ChannelId == channelId && m.UserId == userId);
        if (member == null)
        {
            return;
        }

        await _channelMemberRepository.DeleteAsync(member);

        await _chatRealtimeService.SendKickedFromChannelAsync(userId, channelId);
    }
}
