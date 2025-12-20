// component/order-card/order-card.js
import {calDayCount} from '../../utils/util'

const statusMap={
  "HOLD":"等待支付",
  "CONFIRMED":"待入住",
  "CHECKED_IN":"已入住",
  "ACCOMPLISHED":"已完成",
  "CANCELLED":"已取消",
  "EXPIRED":"已取消"
}

Component({

  /**
   * 组件的属性列表
   */
  properties: {
    orderDetail:{
      type:Object
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    statusText:'',
    dayCount:''
    
  },

  /**
   * 组件的方法列表
   */
  methods: {
    noop(){},
    onConsult(){

    },
    onCancel(){
      console.log("order-card onCancel")
      this.triggerEvent('cancel')
    },
    onPay(){
      wx.navigateTo({
        url:`/pages/pay/pay?$totalPrice=${this.properties.orderDetail.priceTotal}&id=${this.properties.orderDetail.id}`
      })
    },
    onReserveAgain(){
      wx.navigateTo({
        url:`/pages/room_detail/room_detail?id=${this.properties.orderDetail.roomID}`
      })
    },
    updateStatus(status){
      console.log("updateStatus:",status)
      this.setData({
        orderDetail:{...this.properties.orderDetail,status:status},
        statusText:statusMap[status]
      })
    }
  },
  attached(){
    this.setData({
      statusText:statusMap[this.properties.orderDetail.status],
      dayCount:calDayCount(this.properties.orderDetail.checkInDate,this.properties.orderDetail.checkOutDate)
    })
    
    
  }
})