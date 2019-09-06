using Microsoft.AspNet.SignalR;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ConnectionMappingSample.Hubs {

    public class User {

        public string Name { get; set; }
        public HashSet<string> ConnectionIds { get; set; }
    }

    [Authorize]
    public class ChatHub : Hub {
        private static readonly ConcurrentDictionary<string, User> Users 
            = new ConcurrentDictionary<string, User>(StringComparer.InvariantCultureIgnoreCase);

        public void Send(string message) {
            string sender = Context.User.Identity.Name;
            Clients.All.received(new { sender, message, isPrivate = false });
        }

        public void Send(string message, string to) {
            User receiver;
            if (Users.TryGetValue(to, out receiver)) {
                User sender = GetUser(Context.User.Identity.Name);

                IEnumerable<string> allReceivers;
                lock (receiver.ConnectionIds)
                    lock (sender.ConnectionIds)
                        allReceivers = receiver.ConnectionIds.Concat(sender.ConnectionIds);
                string group = $"{sender.Name}-{to}";
                string group_to_from = $"{to}-{sender.Name}";
                foreach (string cid in allReceivers)
                {
                    Clients.Client(cid).received(new { sender = sender.Name, to, message, isPrivate = true });
                }
                //Clients.Group(group).received(new { sender = sender.Name, to, message, isPrivate = true });
            }
        }

        public IEnumerable<string> GetConnectedUsers() {
            return Users.Where(x => {
                lock (x.Value.ConnectionIds) {
                    return !x.Value.ConnectionIds.Contains(Context.ConnectionId, StringComparer.InvariantCultureIgnoreCase);
	            }
            }).Select(x => x.Key);
        }

        public override Task OnConnected() {

            string userName = Context.User.Identity.Name;
            string connectionId = Context.ConnectionId;

            var user = Users.GetOrAdd(userName, _ => new User {
                Name = userName,
                ConnectionIds = new HashSet<string>()
            });

            lock (user.ConnectionIds) {
                user.ConnectionIds.Add(connectionId);
                if (user.ConnectionIds.Count == 1) 
                    Clients.Others.userConnected(userName);
            }
            return base.OnConnected();
        }

        public override Task OnDisconnected(bool stopCalled)
        {
            string userName = Context.User.Identity.Name;
            string connectionId = Context.ConnectionId;
            
            User user;
            Users.TryGetValue(userName, out user);
            
            if (user != null) {
                lock (user.ConnectionIds) {
                    user.ConnectionIds.RemoveWhere(cid => cid.Equals(connectionId));
                    if (!user.ConnectionIds.Any()) {
                        User removedUser;
                        Users.TryRemove(userName, out removedUser);
                        Clients.Others.userDisconnected(userName);
                    }
                }
            }

            return base.OnDisconnected(stopCalled);
        }

        private User GetUser(string username) {

            User user;
            Users.TryGetValue(username, out user);

            return user;
        }
    }
}