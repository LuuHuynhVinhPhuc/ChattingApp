using MessageApp.EntityFrameworkCore;
using Volo.Abp.Autofac;
using Volo.Abp.Modularity;

namespace MessageApp.DbMigrator;

[DependsOn(
    typeof(AbpAutofacModule),
    typeof(MessageAppEntityFrameworkCoreModule),
    typeof(MessageAppApplicationContractsModule)
)]
public class MessageAppDbMigratorModule : AbpModule
{
}
