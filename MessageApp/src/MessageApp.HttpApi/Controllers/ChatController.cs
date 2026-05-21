using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp;
using MessageApp.Chat;

namespace MessageApp.Controllers;

[Authorize]
[RemoteService(Name = "Chat")]
[Route("api/app/chat")]
[ValidateAntiForgeryToken]
public class ChatController : MessageAppController, IChatAppService
{
    private readonly IChatAppService _chatAppService;

    public ChatController(IChatAppService chatAppService)
    {
        _chatAppService = chatAppService;
    }

    [HttpGet]
    [Route("channels")]
    public virtual Task<List<ChatChannelDto>> GetChannelsAsync()
    {
        return _chatAppService.GetChannelsAsync();
    }

    [HttpPost]
    [Route("channel")]
    public virtual Task<ChatChannelDto> CreateChannelAsync(CreateChatChannelDto input)
    {
        return _chatAppService.CreateChannelAsync(input);
    }

    [HttpGet]
    [Route("channel-messages")]
    public virtual Task<List<ChatMessageDto>> GetChannelMessagesAsync([FromQuery] Guid channelId)
    {
        return _chatAppService.GetChannelMessagesAsync(channelId);
    }

    [HttpGet]
    [Route("private-messages")]
    public virtual Task<List<ChatMessageDto>> GetPrivateMessagesAsync([FromQuery] Guid receiverId)
    {
        return _chatAppService.GetPrivateMessagesAsync(receiverId);
    }

    [HttpGet]
    [Route("users")]
    public virtual Task<List<ChatUserDto>> GetUsersAsync()
    {
        return _chatAppService.GetUsersAsync();
    }

    [HttpPost]
    [Route("send-message")]
    public virtual Task<ChatMessageDto> SendMessageAsync([FromBody] SendMessageDto input)
    {
        return _chatAppService.SendMessageAsync(input);
    }

    [HttpGet]
    [Route("channels/{channelId}/members")]
    public virtual Task<List<ChatUserDto>> GetChannelMembersAsync(Guid channelId)
    {
        return _chatAppService.GetChannelMembersAsync(channelId);
    }

    [HttpGet]
    [Route("channels/{channelId}/non-members")]
    public virtual Task<List<ChatUserDto>> GetNonMembersAsync(Guid channelId)
    {
        return _chatAppService.GetNonMembersAsync(channelId);
    }

    [HttpPost]
    [Route("channels/{channelId}/members/{userId}")]
    public virtual Task AddMemberAsync(Guid channelId, Guid userId)
    {
        return _chatAppService.AddMemberAsync(channelId, userId);
    }

    [HttpDelete]
    [Route("channels/{channelId}/members/{userId}")]
    public virtual Task RemoveMemberAsync(Guid channelId, Guid userId)
    {
        return _chatAppService.RemoveMemberAsync(channelId, userId);
    }
}
