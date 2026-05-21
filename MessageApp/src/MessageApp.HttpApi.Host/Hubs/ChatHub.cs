using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using MessageApp.Chat;
using Volo.Abp.AspNetCore.SignalR;

namespace MessageApp.Hubs;

[Authorize]
[HubRoute("/signalr-hubs/chat")]
public class ChatHub : AbpHub
{
    private readonly ChatUserPresenceService _presenceService;

    public ChatHub(ChatUserPresenceService presenceService)
    {
        _presenceService = presenceService;
    }

    public override async Task OnConnectedAsync()
    {
        await base.OnConnectedAsync();

        var userId = CurrentUser.Id;
        if (userId.HasValue)
        {
            _presenceService.AddUser(userId.Value, Context.ConnectionId);
            // Broadcast to other users that this user is online
            await Clients.Others.SendAsync("UserOnline", userId.Value);
        }
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = CurrentUser.Id;
        if (userId.HasValue)
        {
            _presenceService.RemoveUser(userId.Value);
            // Broadcast to other users that this user is offline
            await Clients.Others.SendAsync("UserOffline", userId.Value);
        }

        await base.OnDisconnectedAsync(exception);
    }

    public async Task JoinChannel(string channelId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, channelId);
    }

    public async Task LeaveChannel(string channelId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, channelId);
    }

    public async Task SendTypingIndicator(string? receiverId, string? channelId, bool isTyping)
    {
        var senderId = CurrentUser.Id;
        var userName = CurrentUser.UserName;

        if (senderId == null) return;

        if (!string.IsNullOrEmpty(channelId))
        {
            // Broadcast typing indicator to others in the channel
            await Clients.OthersInGroup(channelId).SendAsync("UserTyping", new
            {
                senderId = senderId.Value,
                userName,
                channelId,
                isTyping
            });
        }
        else if (!string.IsNullOrEmpty(receiverId))
        {
            // Send typing indicator directly to the receiver
            await Clients.User(receiverId).SendAsync("UserTyping", new
            {
                senderId = senderId.Value,
                userName,
                isTyping
            });
        }
    }
}
