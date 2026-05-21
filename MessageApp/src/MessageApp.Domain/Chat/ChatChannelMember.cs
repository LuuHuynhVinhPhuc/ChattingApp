using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace MessageApp.Chat;

public class ChatChannelMember : CreationAuditedEntity<Guid>
{
    public Guid ChannelId { get; set; }
    public Guid UserId { get; set; }

    protected ChatChannelMember()
    {
    }

    public ChatChannelMember(Guid id, Guid channelId, Guid userId)
        : base(id)
    {
        ChannelId = channelId;
        UserId = userId;
    }
}
