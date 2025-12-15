// pages/index/index.js
import {HTTPRequest} from '../../utils/request.js';
const app=getApp()

Page({
  // prices:{
  //   "2025-12-11":130,

  // }
  /**
   * 页面的初始数据
   */
  data: {
    showDateSelector:false,
    today:'',
    end_day:'',
    checkInDate:'',
    checkOutDate:'',
    dayCount:'',
    headCount:'',
    minPrice:'',
    maxPrice:'',
    roomTypeList:[
      {id:'TWIN',name:'双床房',isSelected:true},
      {id:'QUEEN',name:'大床房',isSelected:true},
      {id:'FAMILY',name:'家庭房',isSelected:true},
      {id:'BUSINESS_SUITE',name:'商务套房',isSelected:true},
    ],
    selectedRooms:['TWIN','QUEEN','FAMILY','BUSINESS_SUITE']
  },

  async onSearch(){
    const data={
      in:this.data.checkInDate,
      out:this.data.checkOutDate,
      people:this.data.headCount,
      minPrice:this.data.minPrice,
      maxPrice:this.data.maxPrice
    }
    const header={
      'content-type': 'application/json'
    }
    try{
      const res=await HTTPRequest('GET','/rooms/search',data,header)
      console.log('onSearch res:',res)

      if(res.statusCode==200){
        console.log('成功获取房间列表')
        const searchResult=res.data
        const cacheKey = `room_search_result_${Date.now()}`;
        wx.setStorageSync(cacheKey, searchResult);
        wx.navigateTo({
          url: `/pages/room_result/room_result?cacheKey=${cacheKey}`
    });
      }else{
        wx.showToast({
          title:res.data.message || `搜索失败（code:${res.statusCode}）`,
          icon: 'none',
          duration: 2000
        })
      }
    }catch(err){
      console.error('请求异常:', err);
      wx.showToast({ title: '网络错误，请检查连接', icon: 'none' });
    }
    
    // const searchResult = [{
    //   id:1,
    //   images: ["http://cdn.xtuctuy.top/images/icon.png","http://cdn.xtuctuy.top/images/collected.png"],
    //   name: "111111",
    //   address:"上海市曹安公路4800号同济大学",
    //   description:"本店位于嘉定区曹安公路4800号同济大学，大学专业提供专属学习氛围",
    //   // location:{
    //   //   ""
    //   // },
    //   distance: 2,
    //   area: 10,
    //   bedroomCount: 2,
    //   livingdining: 1,
    //   bed: 2,
    //   capacity: 4,
    //   price: 200,
    //   tags: ["洗衣机","麻将桌"],
    //   isCollected: true
    // },{
    //   id:2,
    //   images: ["http://cdn.xtuctuy.top/images/collected.png","http://cdn.xtuctuy.top/images/icon.png"],
    //   name: "222222",
    //   address:"上海市曹安公路4801号同济大学",
    //   description:"本店位于嘉定区曹安公路4800号同济大学，大学专业提供专属学习氛围",
    //   // location:{
    //   //   ""
    //   // },
    //   distance: 2,
    //   area: 10,
    //   bedroom: 2,
    //   livingdining: 1,
    //   bed: 2,
    //   capacity: 4,
    //   price: 200,
    //   tags: ["洗衣机","麻将桌"],
    //   isCollected: true
    // }]
    // const cacheKey = `room_search_result_${Date.now()}`;
    // wx.setStorageSync(cacheKey, searchResult);
    // wx.navigateTo({
    //   url: `/pages/room_result/room_result?cacheKey=${cacheKey}`
    // });
  },
  toggleRoom(e) {
    // 获取点击的房型id（来自 data-id="{{item.id}}"）
    const roomId = e.currentTarget.dataset.id; 
    // 切换选中状态
    const newRoomTypeList = this.data.roomTypeList.map(item => {
      if (item.id === roomId) { // 匹配点击的房型
        return { ...item, isSelected: !item.isSelected };
      }
      return item;
    });
    // 更新数据 页面重新渲染（按钮样式随之变化）
    this.setData({ roomTypeList: newRoomTypeList });

    const selectedRooms = newRoomTypeList
      .filter(item => item.isSelected)
      .map(item => item.id);
    this.setData({
      selectedRooms:selectedRooms
    })
    console.log('selectedRooms:',this.data.selectedRooms)
  },
  onMinus(){
    this.setData({
      headCount:this.data.headCount-1
    })
    console.log('headCount:',this.data.headCount)
  },
  onAdd(){
    this.setData({
      headCount:this.data.headCount+1
    })
    console.log('headCount:',this.data.headCount)
  },
  lowValueChangeAction(e){
    this.setData({
      minPrice:e.detail.lowValue
    })
  },
  highValueChangeAction(e){
    this.setData({
      maxPrice:e.detail.heighValue
    })
  },

  setDayCount(){
    const start=new Date(this.data.checkInDate)
    const end =new Date(this.data.checkOutDate)

    start.setHours(0,0,0,0)
    end.setHours(0,0,0,0)

    const msCount=end.getTime()-start.getTime()
    const dayCount=Math.floor(msCount/(24*60*60*1000))

    this.setData({
      dayCount:dayCount
    })

    console.log('dayCount:',this.data.dayCount)

    
  },

  onHideModal(){
    this.setData({
      showDateSelector:false
    })
  },
  
  onShowModal(){
    this.setData({
      showDateSelector:true
    })
  },

  confirmDate(e){
    const {checkInDate,checkOutDate}=e.detail
    console.log('index checkInDate:',checkInDate)
    console.log('index checkOutDate:',checkOutDate)

    this.setData({
      checkInDate:checkInDate,
      checkOutDate:checkOutDate
    })
    app.globalData.checkInDate=checkInDate
    app.globalData.checkOutDate=checkOutDate
    
    this.setDayCount()

    this.onHideModal()
    
  },

  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      today:app.globalData.today,
      checkInDate:app.globalData.checkInDate,
      checkOutDate:app.globalData.checkOutDate,
      headCount:2,
      minPrice:0,
      maxPrice:1500,
    })
    this.setDayCount()
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    const now = new Date();
    const year1 = now.getFullYear();
    const month1 = (now.getMonth() + 1).toString().padStart(2,'0');
    const day1 = now.getDate().toString().padStart(2,'0');

    const tomorrow=new Date(now)
    tomorrow.setDate(tomorrow.getDate()+1)
    const year2=tomorrow.getFullYear()
    const month2=(tomorrow.getMonth()+1).toString().padStart(2,'0')
    const day2=tomorrow.getDate().toString().padStart(2,'0')

    this.setData({
      today:`${year1}-${month1}-${day1}`,
      checkInDate:`${year1}-${month1}-${day1}`,
      checkOutDate:`${year2}-${month2}-${day2}`
    });
    console.log(this.data)
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})