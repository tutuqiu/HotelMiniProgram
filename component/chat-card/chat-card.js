// component/chat-card/chat-card.js
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    chatRoomDetails:{
      type:Object
    },
    imgPrefix:{
      type:String
    },
    unreadByChatRoom:{
      type:Object
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    unread:0,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    updateUnread(unreadByChatRoom){
      this.setData({
        unreadByChatRoom:unreadByChatRoom,
        unread:unreadByChatRoom[this.properties.chatRoomDetails.id]
      })
      console.log("update unread:",this.data.unread)
    }
  },
  attached(){
    console.log(this.properties.unreadByChatRoom)
    this.updateUnread(this.properties.unreadByChatRoom)
  }
})