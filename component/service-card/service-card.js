// component/service-card/service-card.js
const statusMap={
  "PENDING":"等待处理",
  "IN_PROGRESS":"处理中",
  "COMPLETED":"已完成",
  "CANCELLED":"已取消",
}
const typeMap={
  "DELIVERY":{
    label:"客房送物",
    icon:"http://cdn.xtuctuy.top/images/delivery.png"
  },
  "EXTEND_STAY":{
    label:"续住",
    icon:"http://cdn.xtuctuy.top/images/extend-stay.png"
  },
  "CLEANING":{
    label:"客房清理",
    icon:"http://cdn.xtuctuy.top/images/cleaning.png"
  },
  "LAUNDRY":{
    label:"洗衣净物",
    icon:"http://cdn.xtuctuy.top/images/laundry.png"
  }
}

Component({

  /**
   * 组件的属性列表
   */
  properties: {
    serviceDetail:{
      type:Object,
      observer(newVal){
        this.setData({serviceDetail:newVal})
        this.update()
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    icon:'',
    typeText:'',
    statusText:''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    update(){
      this.setData({
        icon:typeMap[this.properties.serviceDetail.type].icon,
        typeText:typeMap[this.properties.serviceDetail.type].label,
        statusText:statusMap[this.properties.serviceDetail.status]
      })
    },
    onCancel(){
      this.triggerEvent('cancel')
    }
  },
  attached(){
    this.update()
  }
})