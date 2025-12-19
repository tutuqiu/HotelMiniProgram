// component/room-card/room-card.js
import {calDayCount} from '../../utils/util'

Component({
  properties:{
    roomData:{
      type:Object
    },
    imgPrefix:{
      type:String
    },
    collectedList:{
      type:Array
    },
    checkInDate:{
      type:String
    },
    checkOutDate:{
      type:String
    }
  },

  /**
   * 页面的初始数据
   */
  data: {
    isCollected:false,
    avgPrice:0,
  },

  methods:{
    onCollectTap(e){
      // 触发父页面的“收藏事件”（传递房间ID）
      this.triggerEvent('collect', { id: this.properties.roomData.id });
    },
    onCardTap(){
      // 触发父页面的「卡片点击」事件，传递当前房间ID
      this.triggerEvent('cardTap', { 
        id: this.data.roomData.id 
      });
    },
    updateCollectedList(collectedList){
      console.log('room-card:updateCollectedList')
      this.setData({
        collectedList:collectedList
      })
      this.setCollected()
      // console.log('room-card',this.data.roomData.id)
      // console.log('room-card collectedList:',this.data.collectedList)
    },
    setCollected(){
      const status=this.data.collectedList.includes(this.data.roomData.id)
      console.log(`room ${this.data.roomData.id} collected?:${status}`)
      this.setData({
        isCollected:status
      })
    },
    setAvgPrice(){
      // console.log(this.properties.roomData.totalPrice)
      this.setData({
        avgPrice:this.properties.roomData.totalPrice/calDayCount(this.properties.checkInDate,this.properties.checkOutDate)
      })
    },
  },
  
  attached(){
    console.log("collectedList:",this.properties.collectedList)
    this.setCollected()
    this.setAvgPrice()
    
  }
})