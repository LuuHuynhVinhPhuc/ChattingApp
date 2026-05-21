using MessageApp.Samples;
using Xunit;

namespace MessageApp.EntityFrameworkCore.Applications;

[Collection(MessageAppTestConsts.CollectionDefinitionName)]
public class EfCoreSampleAppServiceTests : SampleAppServiceTests<MessageAppEntityFrameworkCoreTestModule>
{

}
