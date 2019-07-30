// 注册
Vue.component('cb1', {
    template: '<div><p>text:{{text}}#{{unicomId}}</p><p>msg: {{msg}}</p></div>',
    unicomName: ['b', 'b1'],
    unicom: {
        message: function({data}){
            this.msg = data
        }
    },
    data: function(){
        return {
            text: 'component - cb1',
            msg: ''
        }
    }
})