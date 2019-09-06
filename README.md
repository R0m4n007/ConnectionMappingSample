Chat

ASP.NET SignalR

La idea de un chat, es la conexión entre 2 o más personas, interactuando en tiempo real, partiendo de que vamos a desarrollar una aplicación MVC de ASP.NET, debemos incluir o agregar la biblioteca ASP.NET SignalR, la cual agrega funcionalidad web en tiempo real a nuestra aplicación. La funcionalidad web en tiempo real es la capacidad de tener contenido de inserción de código del lado del servidor para los clientes conectados tal como sucede, en tiempo real. 

Utilizamos ASP.NET porque es un marco de aplicaciones web del lado del servidor de código abierto diseñado para el desarrollo web para producir páginas web dinámicas desarrolladas por Microsoft para permitir a los programadores crear sitios web dinámicos , aplicaciones y servicios. En este caso a la hora de crear el proyecto escogimos Aplicación web ASP.NET(.NET FRAMEWORK) ya que nos da plantillas para el proyecto del tipo Web Forms, MVC o Web API, entre otros. Seleccionamos en la parte de Framework la versión de .NET FRAMEWORK 4.6.1. Ya con el nombre y la versión del Framework, le damos siguiente y aparece una pestaña “Nueva Aplicaion web ASP.NET”, elegimos la opcion MVC, lo cual genera una plantilla de proyecto para crear aplicaciones ASP.NET MVC permitiendo compilarlas en una arquitectura de Modelo-Vista-Controlador.







SignalR

SignalR aprovecha varios transportes, seleccionando automáticamente el mejor transporte disponible dado el mejor transporte disponible del cliente y del servidor. SignalR aprovecha WebSocket , una API HTML5 que permite la comunicación bidireccional entre el navegador y el servidor. SignalR usará WebSockets debajo de las cubiertas cuando esté disponible, y recurrirá con gracia a otras técnicas y tecnologías cuando no lo esté, mientras que el código de la aplicación sigue siendo el mismo. 
SignalR también proporciona una API simple de alto nivel para realizar RPC de servidor a cliente (llamar a funciones de JavaScript en el navegador de un cliente desde el código .NET del lado del servidor) en una aplicación ASP.NET, así como agregar enlaces útiles para la administración de la conexión , como eventos de conexión / desconexión, agrupación de conexiones, autorización; lo cual explicaremos más tarde. entiende En el administrador de Paquetes NuGet buscamos SignalR.****acá iría la versión ***







Entity 

También usamos Entity Framework para lo que es la privacidad de un chat, a esto nos referimos a conectar, en una red de varios usuarios, solo dos personas interactuando sin que los demás sean conscientes de ello. Es decir una persona le quiere escribir a otra en privado, lo logramos gracias a Identity lo cual nos dio un “Id” de la persona aparte del de la conexión. ***versión o lo que falte jeje***

Visual

Para lo visual utilizamos Bootstrap y knockout que se complementan muy bien con JQuery, es decir utilizamos Bootstrap ya que es un kit de herramientas de código abierto para desarrollar con HTML, CSS y JS,lo cual nos simplifica a la hora de que la IU se vea más bonita. Luego usamos Knockout que es una biblioteca de JavaScript que le ayuda a crear interfaces de usuario de pantalla y editor enriquecidas y receptivas con un modelo de datos subyacente limpio. Cada vez que tenemos secciones de la interfaz de usuario que se actualicen dinámicamente (por ejemplo, que cambien según las acciones del usuario o cuando cambie una fuente de datos externa), KO nos ayuda a implementarlo de manera más simple y sostenible. Lo importante de estos es que son compatibles totalmente con JQuery, e incluso Bootstrap lo necesita y KO soluciona un problema diferente.

¿Porque usamos JQuery?

 Porque SignalR necesita otro paquete llamado SignalR.JS y, este último necesita de JQuery, pero en si se necesita porque la idea de usar SignalR es la interactividad de un usuario y el servidor, por ello las funcionalidades se hacen desde el lado del cliente y el servidor, llamando funciones de javascript del lado del cliente como explicamos anteriormente,en nuestro caso usando JQuery y .net del lado del servidor.
Por ejemplo, la siguiente función se encuentra en un método (Send) de la clase Chathub en el archivo ChatHub.cs:

 Clients.All.received(new { sender = sender, message = message, isPrivate = false });

La siguiente función se encuentra dentro de la función de inicio de JQuery (“$(){}”) en el archivo chat.js:

chatHub.client.received = function (message) {
            viewModel.messages.push(new Message(message.sender, message.message, message.isPrivate)); };

