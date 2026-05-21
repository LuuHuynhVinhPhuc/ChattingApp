using System;
using System.Threading.Tasks;

namespace MessageApp.Chat;

public interface IChatRealtimeService
{
    Task SendMessageAsync(ChatMessageDto message);
    Task SendAddedToChannelAsync(Guid userId, ChatChannelDto channel);
    Task SendKickedFromChannelAsync(Guid userId, Guid channelId);
}
