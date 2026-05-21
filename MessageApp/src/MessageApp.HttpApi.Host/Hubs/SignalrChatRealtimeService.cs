using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using MessageApp.Chat;
using MessageApp.Hubs;
using Volo.Abp.DependencyInjection;

namespace MessageApp.Services;

public class SignalrChatRealtimeService : IChatRealtimeService, ITransientDependency
{
    private readonly IHubContext<ChatHub> _hubContext;

    public SignalrChatRealtimeService(IHubContext<ChatHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task SendMessageAsync(ChatMessageDto message)
    {
        if (message.ChannelId.HasValue)
        {
            // Send to everyone connected to the channel group
            await _hubContext.Clients.Group(message.ChannelId.Value.ToString())
                .SendAsync("ReceiveMessage", message);
        }
        else if (message.ReceiverId.HasValue)
        {
            // Send to receiver
            await _hubContext.Clients.User(message.ReceiverId.Value.ToString())
                .SendAsync("ReceiveMessage", message);

            // Send to sender (to sync multiple tabs/devices)
            await _hubContext.Clients.User(message.SenderId.ToString())
                .SendAsync("ReceiveMessage", message);
        }
    }

    public async Task SendAddedToChannelAsync(Guid userId, ChatChannelDto channel)
    {
        await _hubContext.Clients.User(userId.ToString()).SendAsync("AddedToChannel", channel);
    }

    public async Task SendKickedFromChannelAsync(Guid userId, Guid channelId)
    {
        await _hubContext.Clients.User(userId.ToString()).SendAsync("KickedFromChannel", channelId);
    }
}
