using System.Threading.Tasks;

namespace MessageApp.Data;

public interface IMessageAppDbSchemaMigrator
{
    Task MigrateAsync();
}
