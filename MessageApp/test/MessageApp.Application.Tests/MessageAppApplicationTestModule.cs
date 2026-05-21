using Volo.Abp.Modularity;

namespace MessageApp;

[DependsOn(
    typeof(MessageAppApplicationModule),
    typeof(MessageAppDomainTestModule)
)]
public class MessageAppApplicationTestModule : AbpModule
{

}
