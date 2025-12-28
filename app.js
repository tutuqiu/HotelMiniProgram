// app.js
const req = require('/utils/request.js')

App({
  globalData: {
    //websocket:
    wsUrl:"ws://xtuctuy.top:8080/ws",
    socketStatus: "DISCONNECTED", // DISCONNECTED | CONNECTING | CONNECTED
    stompStatus:"DISCONNECTED",
    reconnectAttempts: 1,
    reconnectTimer: null,

    chatRoomsDetails:[],
    unreadTotal: 0,
    unreadByChatRoom: {}, // { [Id]: number }
    currentChatRoomId:'',
    listeners:new Set(),
    prebookRoomId:'',

    //app统一变量
    isLogin:false,
    today:'',
    checkInDate:'',
    checkOutDate:'',
    minPrice:'',
    maxPrice:'',
    headCount:1,
    bedCount:1,
    bedroomCount:1,
    // living_diningCount:'',
    imgPrefix:'',
    
    //用户信息
    userInfo: {
      id:'',
      avatarUrl:"",
      nickName:"",
      phoneNumber:"",
      token:"",
      collectedList:[]
    }
  },
  async onLaunch() {
    // 注册 WebSocket 监听
    this.initSocketListeners()

    this.getImgPrefix();
    this.initDate()

    // 获取登录状态+用户信息 在之前login时会存储token+expireTime(毫秒）在本地
    // token具有时效性 
    const token = wx.getStorageSync('token') || ""
    console.log('old token:',token)
    if(token){
      const expireTime = wx.getStorageSync('expireTime') || null
      console.log('expireTime:',expireTime)
      if(expireTime){
        const now = Date.now()
        if (expireTime>now){
          console.log('未过期，刷新登录状态')
          // 刷新token 并用新token更新个人信息
          await this.refresh()
          await this.getChatRoomsDetails()
          // 尝试连接websocket
          this.ensureSocketConnected()
        }else{
          wx.setStorageSync('token',"")
        } 
      }
      
    }
  },

  async getChatRoomsDetails(){
    console.log("getChatRoomsDetails")
    const header={
      'Authorization':'Bearer ' + this.getToken()
    }
    try{
      const res = await req.HTTPRequest('GET','/chat/rooms',{},header)
      console.log("getChatRoomsDetails res:",res)
  
      if(res.statusCode==200){
        const rooms = res.data
        console.log('获取聊天列表成功:',rooms)
        
        const prebook = rooms.find(r => r.type === "PREBOOK")
        this.globalData.prebookRoomId = prebook?.id ?? null

        const rooms_after = rooms.map(room => ({
          ...room,
          name: room.type === "PREBOOK" ? "客服" : room.name
        }))

        this.globalData.chatRoomsDetails = rooms_after

        console.log("chatRoomsDetails:",this.globalData.chatRoomsDetails)
        console.log("prebookRoomId:",this.globalData.prebookRoomId)
      }else{
        wx.showToast({
          title:res.data.message || `获取聊天列表失败（code:${res.statusCode}）`,
          icon: 'none',
          duration: 2000
        })
      }
    }catch(err){
      console.error('获取聊天列表异常:', err);
      wx.showToast({ title: '网络错误，请检查连接', icon: 'none' });
    }
    
  },
  initDate(){
    // 初始化日期
    const now = new Date();
    const year1 = now.getFullYear();
    const month1 = (now.getMonth() + 1).toString().padStart(2,'0');
    const day1 = now.getDate().toString().padStart(2,'0');

    const tomorrow=new Date(now)
    tomorrow.setDate(tomorrow.getDate()+1)
    const year2=tomorrow.getFullYear()
    const month2=(tomorrow.getMonth()+1).toString().padStart(2,'0')
    const day2=tomorrow.getDate().toString().padStart(2,'0')
    
    this.globalData.today=`${year1}-${month1}-${day1}`
    this.globalData.checkInDate=`${year1}-${month1}-${day1}`
    this.globalData.checkOutDate=`${year2}-${month2}-${day2}`
  },
  getToken(){
    return this.globalData.userInfo.token
  },
  needToRefresh(){
    const expireTime = wx.getStorageSync('expireTime') || null
    console.log('expireTime:',expireTime)
    const now = Date.now()
    if(expireTime&&expireTime>now)
      return false
    else
    return true
  },

  async refresh(){
    const refreshTokenId=wx.getStorageSync('refreshTokenId')||null
    const data = {
      refreshTokenId:refreshTokenId
    }
    const header ={
      'content-type': 'application/json',
    }
    try{
      const res = await req.HTTPRequest('POST','/public/auth/refresh',data,header)
      console.log(res)
  
      if(res.statusCode==200){
        const info = res.data
        console.log('刷新登录成功:',info)
  
        this.globalData.userInfo.token=info.accessToken
        wx.setStorageSync('token',info.accessToken)
        console.log("new token:",info.accessToken)
        
        const expireTime = new Date(Date.now() + info.expiresInSeconds * 1000)//有效时间转化为毫秒级别
        wx.setStorageSync('expireTime',expireTime.getTime())

        wx.setStorageSync('refreshTokenId',info.refreshTokenId)

        this.globalData.isLogin=true

        // 更新个人信息
        this.getUserInfo(info.accessToken)
        
        console.log('userInfo:',this.globalData.userInfo)
        console.log('isLogin:',this.globalData.isLogin)
  
      }else{
        console.log('refreshTokenId过期')
      }
    }catch(err){
      console.error('验证异常:', err);
      wx.showToast({ title: '网络错误，请检查连接', icon: 'none' });
    }
  },
  async getUserInfo(token){
    try{
      const data = {}
      const header={
        'Authorization':'Bearer ' + token
      }
      const res = await req.HTTPRequest('GET','/me',data,header)
      console.log(res)
  
      if(res.statusCode==200){
        const info = res.data
        console.log('获取信息成功:',info)
  
        this.globalData.userInfo.avatarUrl=info.avatarUrl
        this.globalData.userInfo.nickName=info.name 
        this.globalData.userInfo.phoneNumber=info.phone
        this.globalData.isLogin=true
        this.globalData.userInfo.collectedList=info.favorite_rooms
        this.globalData.userInfo.id=info.id
        
        
        console.log('userInfo:',this.globalData.userInfo)
        console.log('isLogin:',this.globalData.isLogin)
  
      }else{
        wx.showToast({
          title:res.data.message || `获取信息失败（code:${res.statusCode}）`,
          icon: 'none',
          duration: 2000
        })
      }
    }catch(err){
      console.error('验证异常:', err);
      wx.showToast({ title: '网络错误，请检查连接', icon: 'none' });
    }
  },
  async getImgPrefix(){
    try{
      const res = await req.HTTPRequest('GET','/cdn',{},{})
      console.log(res)

      if(res.statusCode==200){
        this.globalData.imgPrefix=res.data.url
        console.log('imgPrefix:',this.globalData.imgPrefix)
      }else{
        console.log('getImgPrefix失败:',res.data.message)
        this.globalData.imgPrefix="http://cdn.xtuctuy.top"
      }
    }catch(err){
      console.error('请求异常:', err);
      this.globalData.imgPrefix="http://cdn.xtuctuy.top"
    }
  },

  // 构造并发送 STOMP 帧
  stompSendFrame(command, headers = {}, body = "") {
    let frame = command + "\n";
    Object.keys(headers).forEach(key => {
      frame += key + ":" + headers[key] + "\n";
    });
    frame += "\n";      // 空行分隔 header 和 body
    frame += body || "";
    frame += "\0";      // STOMP 帧结束符
  
    wx.sendSocketMessage({ data: frame });
  },

  subscribeAllRooms(){
    const rooms = this.globalData.chatRoomsDetails || []
    if (!rooms.length) {
      console.log('没有可订阅的房间');
      return
    }

    rooms.forEach(room => {
      const id = room.id
      if (!id) 
        return
      this.subscribeRoom(id)
      this.globalData.unreadByChatRoom[id]=0
    })
  
    console.log('已订阅房间数量:', rooms.length)
  },
  subscribeRoom(id){
    this.stompSendFrame("SUBSCRIBE", {
      id: "room-" + id,   // 订阅ID
      destination: "/topic/rooms/" + id,
      ack: "auto"
    });
  },

  // todo 待更新
  cleanLocalInfo(){
    this.globalData.isLogin=false
  
    this.globalData.chatRoomsDetails=[],
    this.globalData.unreadTotal=0
    this.globalData.unreadByChatRoom= {}
    this.globalData.currentChatRoomId=''
    this.globalData.prebookRoomId=''
    //todo 退出之后好像不会再+了
    // this.globalData.listeners=new Set()

    this.globalData.userInfo.id=""
    this.globalData.userInfo.avatarUrl=""
    this.globalData.userInfo.nickName=""
    this.globalData.userInfo.phoneNumber=""
    this.globalData.userInfo.token=""
    this.globalData.userInfo.collectedList=[]


  },

  async connectStomp(){
    // 建立 STOMP 会话：发送 CONNECT 帧
    if(this.needToRefresh())
      await this.refresh()

    console.log("connectStomp...")
    this.stompSendFrame("CONNECT", {
      "accept-version": "1.1,1.2",
      "Authorization": "Bearer " + this.getToken()
    })
    this.globalData.stompStatus="CONNECTING"
  },

  disconnectStomp() {
    console.log("disconnectStomp...")
  
    // 1) 如果认为当前是已连接/正在连，就发 DISCONNECT 帧
    if (this.globalData.stompStatus === "CONNECTED" ||
        this.globalData.stompStatus === "CONNECTING") {
  
      // STOMP 规范里 DISCONNECT 不强制带 header
      // 如需确认收到，可加 receipt: 'xxx'
      this.stompSendFrame("DISCONNECT", {
      })
    }
  
    // 2) 本地状态先置为 DISCONNECTED
    this.globalData.stompStatus = "DISCONNECTED"
  },

  ensureSocketConnected() {
    if(!this.globalData.userInfo.token)
      return

    const st = this.globalData.socketStatus
    if (st === "CONNECTED" || st === "CONNECTING") 
      return

    console.log("开始建立 WS 连接...")
    this.globalData.socketStatus = "CONNECTING"

    wx.connectSocket({
      url: this.globalData.wsUrl,
      header: {
        "content-type": "application/json",
        "Authorization": "Bearer " + this.globalData.userInfo.token,
      },
      //发起连接请求成功(!=连接成功 所以在这发送stomp错误)
      success: (res) => {
        console.log('WS 已连接', res);
        this.globalData.socketStatus = "CONNECTED";
      },
      fail: (err) => {
        console.error("connectSocket 失败", err)
        this.globalData.socketStatus = "DISCONNECTED"
        // 尝试重连
        this.scheduleReconnect()
      }
    })
  },

  //出错 / 关闭websocket后的重连策略（指数退避）
  scheduleReconnect() {
    if(!this.globalData.userInfo.token)
      return
    // 已有定时器就不重复设
    if (this.globalData.reconnectTimer) 
      return

    const n = this.globalData.reconnectAttempts++
    // this.globalData.reconnectAttempts++
    const delay = Math.min(1000 * Math.pow(2, n - 1), 30000) // 1s,2s,4s,...最多30s
    console.log(`准备在 ${delay} ms 后重连，第 ${n} 次`)
    // 更新定时器ID;经过delay ms后 执行ensureSocketConnected() 并清除定时器ID
    this.globalData.reconnectTimer = setTimeout(() => {
      this.globalData.reconnectTimer = null
      this.ensureSocketConnected()
    }, delay)
  },

  initSocketListeners(){
    console.log("init SocketListeners")
    // 连接成功
    wx.onSocketOpen(() => {
      this.globalData.reconnectAttempts = 0;
      console.log("connectStomp...")
      this.stompSendFrame("CONNECT", {
        "accept-version": "1.1,1.2",
        "Authorization": "Bearer " + this.getToken()
      })
      this.globalData.stompStatus="CONNECTING"
    })

    // 连接成功
    wx.onSocketMessage((res) => {
      console.log("onSocketMessage")
      this.handleSocketMessage(res)
    })

    wx.onSocketError((err) => {
      console.error("WS 出错", err)
      this.globalData.socketStatus = 'DISCONNECTED'
      this.scheduleReconnect()
    })

    wx.onSocketClose(() => {
      console.log("WS 已关闭")
      this.globalData.socketStatus = 'DISCONNECTED'
      this.globalData.reconnectAttempts=1
      this.globalData.reconnectTimer=null
    })
  },

  handleSocketMessage(res){
    const raw = res.data
    console.log("WS 收到原始数据:", raw)

    // 1. 按 STOMP 格式拆：headerPart + bodyPart
    const parts = raw.split("\n\n")
    if (parts.length < 2) {
      console.warn("不是完整的 STOMP 帧:", raw)
      return
    }

    const headerPart = parts[0]
    let bodyPart = parts.slice(1).join("\n\n")
    // 去掉最后的 \0
    bodyPart = bodyPart.replace(/\0$/, "")

    const headerLines = headerPart.split("\n")
    const command = headerLines[0]  // MESSAGE / CONNECTED / ERROR ...

    const headers = {}
    for (let i = 1; i < headerLines.length; i++) {
      const line = headerLines[i]
      if (!line) 
        continue

      const idx = line.indexOf(":")
      if (idx > 0) {
        const key = line.substring(0, idx)
        const value = line.substring(idx + 1)
        headers[key] = value
      }
    }

    // 2. 如果是 STOMP 的 CONNECTED：说明 STOMP 会话建立好了，此时订阅所有房间
    if (command === "CONNECTED") {
      console.log("STOMP 已连接:", headers)
      this.globalData.stompStatus="CONNECTED"
      // 一次性订阅所有房间
      this.subscribeAllRooms()
      return
    }

    // 3. 如果是 MESSAGE：处理房间消息
    if (command === "MESSAGE") {
      const destination = headers["destination"] || ""

      // 处理 /topic/rooms/{roomId} 的消息
      if (destination.startsWith("/topic/rooms/")) {
        let chatMsg
        try {
          chatMsg = JSON.parse(bodyPart)  // body 是 ChatMessageDto JSON
        } catch (e) {
          console.error("解析 ChatMessageDto 失败:", bodyPart)
          return
        }

        console.log("解析后的 ChatMessageDto:", chatMsg)

        // 1) 全局处理（更新未读/room 列表/TabBar）
        this.handleMessageInApp(chatMsg)
        // 2) 广播给页面 更新unread
        this.emitMessage(chatMsg)

        return
      }

      // 其他 destination（比如 /user/queue/.../read）你也可以在这儿加分支处理
    }
    // 4. 其他命令先打印出来方便调试
    console.log("收到其他 STOMP 帧:", command, headers, bodyPart)
  },

  //更新service页面+导航栏角标
  handleMessageInApp(msg) {
    console.log("handleMessageInApp")

    const chatRoomId=msg.roomId
    if(!chatRoomId)
      return
    //如果当前页面在对应chatRoom里 不需要更新角标
    if(chatRoomId==this.globalData.currentChatRoomId)
      return

    // 1. 更新 room 的 lastMessage / lastMessageAt（这个跟前面一样）
    // let room = rooms.find(r => r.id === roomId)
    // if (!room) {
    //   room = {
    //     id: roomId,
    //     title: chatMsg.roomTitle || "",
    //     lastMessage: "",
    //     lastMessageAt: ""
    //   }
    //   rooms.push(room)
    // }
    // room.lastMessage = chatMsg.content || ""
    // room.lastMessageAt = chatMsg.createdAt || ""


    // 如果当前不在这个房间，就把消息记到未读数组里
    if(this.globalData.currentChatRoomId!=chatRoomId)
      if(!this.globalData.unreadByChatRoom[chatRoomId])
        this.globalData.unreadByChatRoom[chatRoomId]=0
      this.globalData.unreadByChatRoom[chatRoomId]++

    console.log(this.globalData.unreadByChatRoom)

    this.calUnreadTotal()

    this.refreshTabBarBadge()
  },

  calUnreadTotal(){
    const unreadByChatRoom=this.globalData.unreadByChatRoom
    let total=0
    Object.values(unreadByChatRoom).forEach(value=>{
      console.log('value:',value)
      total+=value
    })
    console.log("total:",total)
    this.globalData.unreadTotal=total
  },

  refreshTabBarBadge(){
    const total = this.globalData.unreadTotal
    console.log("refreshTabBarBadge total:",total)
    const SERVICE_TAB_INDEX = 1 // 第二个 tab

    try {
      if (total > 0) {
        wx.setTabBarBadge({
          index: SERVICE_TAB_INDEX,
          text: total > 99 ? '99+' : String(total)
        })
      } else {
        console.log("remove?")
        wx.removeTabBarBadge({ index: SERVICE_TAB_INDEX,
          success: () => console.log('removeTabBarBadge success'),
          fail: (err) => console.error('removeTabBarBadge fail', err),
          complete: () => console.log('removeTabBarBadge complete') })
      }
    } catch (e) {
      console.warn('更新 TabBar 失败', e)
    }
  },

  inChatRoom(chatRoomId){
    this.globalData.currentChatRoomId=chatRoomId
    this.globalData.unreadByChatRoom[chatRoomId]=0

    this.calUnreadTotal()
  },

  // 页面调用 app.onChatMessage(listener) 来“订阅消息”
  onChatMessage(listener){
    this.globalData.listeners.add(listener)
    // // 返回一个取消订阅的函数
    // return ()=>{
    //   this.globalData.listeners.delete(listener)
    // }
  },
  emitMessage(msg){
    console.log("emitMessage")
    console.log("listeners:",this.globalData.listeners)
    this.globalData.listeners.forEach(fn=>{
      try{
        console.log("fn:",fn)
        fn(msg)
      }catch(e){
        console.error("emitMessage 回调报错", e)
      }
    })
  },

  
})
