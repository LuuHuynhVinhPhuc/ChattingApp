using MessageApp.Samples;
using Xunit;

namespace MessageApp.EntityFrameworkCore.Domains;

[Collection(MessageAppTestConsts.CollectionDefinitionName)]
public class EfCoreSampleDomainTests : SampleDomainTests<MessageAppEntityFrameworkCoreTestModule>
{

}
