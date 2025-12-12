// pages/index/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    today:'',
    end_day:'',
    checkInDate:'',
    checkOutDate:'',
    dayCount:1,
    minPrice:0,
    maxPrice:1500
  },
  onCheckInDateChange(e){
    console.log("choose date:",e.detail.value)
    this.setData({
      checkInDate:e.detail.value
    })
    console.log('checkInDate:',this.data.checkInDate)

    const checkInTime=new Date(this.data.checkInDate).getTime()
    const checkOutTime=new Date(this.data.checkOutDate).getTime()

    if(checkInTime>=checkOutTime){
      const nextDay=new Date(checkInTime + 24*60*60*1000)
      const nextDaystr= nextDay.toISOString().split('T')[0]
      this.setData({
        checkOutDate:nextDaystr
      })
      console.log('checkOutDate:',this.data.checkOutDate)
    }
    this.setDayCount()

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

  onCheckOutDateChange(e){
    console.log("choose date:",e.detail.value)
    this.setData({
      checkOutDate:e.detail.value
    })
    console.log('checkOutDate:',this.data.checkOutDate)

    this.setDayCount()
  },

  onPriceRangeChange(e){
    const [min,max]=e.detail.value
    this.setData({
      minPrice:min,
      maxPrice:max
    })

    console.log('price range:',this.data.minPrice,'-',this.data.maxPrice)
  },

  onMinPriceChange(e){
    const min = e.detail.value
    this.setData({
      minPrice:min
    })
    console.log('minPrice:',this.data.minPrice)
  },
  onMaxPriceChange(e){
    const max = e.detail.value
    this.setData({
      maxPrice:max
    })
    console.log('maxPrice:',this.data.maxPrice)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
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

    const sys = wx.getSystemInfoSync();
    console.log('当前基础库版本：', sys.SDKVersion); 
    // 手动判断是否支持 range 双滑块（≥2.14.0 才支持）
    const supportRange = (v) => {
      const [major, minor] = v.split('.').map(Number);
      return (major > 2) || (major === 2 && minor >= 14);
    };
    console.log('是否支持双滑块：', supportRange(sys.SDKVersion)); 
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