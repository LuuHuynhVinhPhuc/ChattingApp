using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Volo.Abp.EntityFrameworkCore.Modeling;
using MessageApp.Chat;

namespace MessageApp.EntityFrameworkCore.Configurations;

public class ChatMessageConfiguration : IEntityTypeConfiguration<ChatMessage>
{
    public void Configure(EntityTypeBuilder<ChatMessage> builder)
    {
        builder.ToTable(MessageAppConsts.DbTablePrefix + "ChatMessages", MessageAppConsts.DbSchema);
        builder.ConfigureByConvention();

        builder.Property(x => x.Message).IsRequired().HasMaxLength(2048);
    }
}
