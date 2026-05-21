using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace MessageApp.Chat;

public class ChatMessage : CreationAuditedEntity<Guid>
{
    public Guid SenderId { get; set; }
    public Guid? ReceiverId { get; set; } // Null if it's a channel message
    public Guid? ChannelId { get; set; } // Null if it's a private message (direct message)
    public string Message { get; set; } = default!;

    protected ChatMessage()
    {
    }

    public ChatMessage(Guid id, Guid senderId, string message, Guid? receiverId = null, Guid? channelId = null)
        : base(id)
    {
        SenderId = senderId;
        Message = message;
        ReceiverId = receiverId;
        ChannelId = channelId;
    }
}
