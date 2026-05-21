using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace MessageApp.Chat;

public interface IChatAppService : IApplicationService
{
    Task<List<ChatChannelDto>> GetChannelsAsync();
    Task<ChatChannelDto> CreateChannelAsync(CreateChatChannelDto input);
    Task<List<ChatMessageDto>> GetChannelMessagesAsync(Guid channelId);
    Task<List<ChatMessageDto>> GetPrivateMessagesAsync(Guid receiverId);
    Task<List<ChatUserDto>> GetUsersAsync();
    Task<ChatMessageDto> SendMessageAsync(SendMessageDto input);
    Task<List<ChatUserDto>> GetChannelMembersAsync(Guid channelId);
    Task<List<ChatUserDto>> GetNonMembersAsync(Guid channelId);
    Task AddMemberAsync(Guid channelId, Guid userId);
    Task RemoveMemberAsync(Guid channelId, Guid userId);
}
