using Microsoft.AspNet.SignalR;
using Microsoft.Owin;
using Owin;

[assembly: OwinStartup(typeof(blogsiteqqq.Startup))]

namespace blogsiteqqq
{
    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            // SignalR yapılandırması
            var hubConfiguration = new HubConfiguration()
            {
                EnableDetailedErrors = true,
                EnableJSONP = true
            };

            app.MapSignalR(hubConfiguration);
        }
    }
} 