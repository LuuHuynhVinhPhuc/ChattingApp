using Xunit;

namespace MessageApp.EntityFrameworkCore;

[CollectionDefinition(MessageAppTestConsts.CollectionDefinitionName)]
public class MessageAppEntityFrameworkCoreCollection : ICollectionFixture<MessageAppEntityFrameworkCoreFixture>
{

}
