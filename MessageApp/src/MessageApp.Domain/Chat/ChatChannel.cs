using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace MessageApp.Chat;

public class ChatChannel : FullAuditedAggregateRoot<Guid>
{
    public string Name { get; set; } = default!;
    public string? Description { get; set; }

    protected ChatChannel()
    {
    }

    public ChatChannel(Guid id, string name, string? description = null)
        : base(id)
    {
        Name = name;
        Description = description;
    }
}
