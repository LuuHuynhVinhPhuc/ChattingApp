using System.Threading.Tasks;
using Volo.Abp.DependencyInjection;

namespace MessageApp.Data;

/* This is used if database provider does't define
 * IMessageAppDbSchemaMigrator implementation.
 */
public class NullMessageAppDbSchemaMigrator : IMessageAppDbSchemaMigrator, ITransientDependency
{
    public Task MigrateAsync()
    {
        return Task.CompletedTask;
    }
}
