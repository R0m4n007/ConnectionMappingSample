/// <reference path="../knockout-3.5.0.js" />
/// <reference path="../jquery-3.4.1.intellisense.js" />
/// <reference path="../jquery.signalR-2.4.1.min.js" />

class Message {
    constructor(from, msg, isPrivate, viewModel, to = "all") {
        this.from = ko.observable(from)
        this.to = ko.observable(to)
        this.message = ko.observable(msg)
        this.isPrivate = ko.observable(isPrivate)
        this.viewModel = viewModel
        this.isPublic = !isPrivate
    }
}

class User {
    constructor(name, viewModel) {
        this.viewModel = viewModel
        this.name = ko.observable(name)
        this.isPrivateChatUser = ko.observable(false)

        this.setAsPrivateChat = user => {
            this.viewModel.privateChatUser(user.name())
            this.viewModel.isInPrivateChat(true)
            this.viewModel.isInPrivateChatWith = user.name()
            $.each(viewModel.users(), (_, user) => user.isPrivateChatUser(false));
            this.isPrivateChatUser(true)
        }
    }
}

class Context {
    constructor(viewModel, connection, hub, sendBtn, msgTxt, sendBtnPrivate, msgTxtPrivate) {
        this.viewModel = viewModel
        this.connection = connection
        this.hub = hub
        this.sendBtn = sendBtn
        this.msgTxt = msgTxt
        this.sendBtnPrivate = sendBtnPrivate
        this.msgTxtPrivate = msgTxtPrivate
    }
    Init() {
        this.connection.hub.logging = true

        this.hub.client.received = message => {
            if(!message.to) this.viewModel.messages.push(new Message(message.sender, message.message, message.isPrivate, this.viewModel))
            else this.viewModel.messages.push(new Message(message.sender, message.message, message.isPrivate, this.viewModel, message.to))
        }

        this.hub.client.userConnected = username => {
            this.viewModel.users.push(new User(username, this.viewModel))
        }

        this.hub.client.userDisconnected = username => {
            this.viewModel.users.pop(new User(username, this.viewModel))
            if (this.viewModel.isInPrivateChat() && this.viewModel.privateChatUser() === username) {
                this.viewModel.isInPrivateChat(false)
                this.viewModel.privateChatUser(null)
            }
        }

        this.StartConnection()
        ko.applyBindings(this.viewModel)
    }
    StartConnection() {
        this.connection.hub.start().done(() => {
            this.ToggleInputs(false)
            this.BindClickEvents()
            this.msgTxt.focus()
            this.hub.server.getConnectedUsers().done(users => {
                $.each(users, (_, username) => {
                    this.viewModel.users.push(new User(username, this.viewModel))
                })
            })
        }).fail(err => console.log(err))
    }

    BindClickEvents() {
        this.msgTxt.keypress(e => {
            let code = (e.keyCode ? e.keyCode : e.which);
            if (code === 13) {
                this.SendMessage();
            }
        })

        this.msgTxtPrivate.keypress(e => {
            let code = (e.keyCode ? e.keyCode : e.which);
            if (code === 13) {
                this.SendPrivateMessage();
            }
        })

        this.sendBtn.click(e => {
            this.SendMessage();
            e.preventDefault();
        })

        this.sendBtnPrivate.click(e => {
            this.SendPrivateMessage()
            e.preventDefault()
        })
    }

    SendMessage() {
        let msgValue = this.msgTxt.val();
        if (msgValue !== null && msgValue.length > 0) 
            this.hub.server.send(msgValue)
                .fail(err => console.log('Send method failed: ' + err))

        this.msgTxt.val(null);
        this.msgTxt.focus();
    }

    SendPrivateMessage() {
        let msgValue = this.msgTxtPrivate.val();
        if (msgValue !== null && msgValue.length > 0) 
            this.hub.server.send(msgValue, this.viewModel.privateChatUser())
                .fail(err => console.log('Send method failed: ' + err))

        this.msgTxtPrivate.val(null);
        this.msgTxtPrivate.focus();
    }

    ToggleInputs(status) {
        this.sendBtn.prop('disabled', status);
        this.msgTxt.prop('disabled', status);
        this.sendBtnPrivate.prop('disabled', status);
        this.msgTxtPrivate.prop('disabled', status);
    }
}

(() => {
    const viewModel = {
        messages: ko.observableArray([]),
        users: ko.observableArray([]),
        isInPrivateChat: ko.observable(false),
        privateChatUser: ko.observable(),
        exitFromPrivateChat: () => {
            viewModel.isInPrivateChat(false)
            viewModel.privateChatUser(null)
            $.each(viewModel.users(), (_, user) => {
                user.isPrivateChatUser(false)
            })
        }
    }
    let chatHub = $.connection.chatHub,
        $sendBtn = $('#btnSend'),
        $msgTxt = $('#txtMsg'),
        $msgTxtPrivate = $('#txtMsgPrivate'),
        $sendBtnPrivate = $('#btnSendPrivate')
    let context = new Context(viewModel, $.connection, chatHub, $sendBtn, $msgTxt, $sendBtnPrivate, $msgTxtPrivate);
    context.Init()
})()