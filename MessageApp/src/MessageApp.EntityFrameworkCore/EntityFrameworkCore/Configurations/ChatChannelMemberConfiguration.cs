using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Volo.Abp.EntityFrameworkCore.Modeling;
using MessageApp.Chat;

namespace MessageApp.EntityFrameworkCore.Configurations;

public class ChatChannelMemberConfiguration : IEntityTypeConfiguration<ChatChannelMember>
{
    public void Configure(EntityTypeBuilder<ChatChannelMember> builder)
    {
        builder.ToTable(MessageAppConsts.DbTablePrefix + "ChatChannelMembers", MessageAppConsts.DbSchema);
        builder.ConfigureByConvention();

        builder.HasIndex(x => new { x.ChannelId, x.UserId }).IsUnique();
    }
}
