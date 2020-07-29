class MVVM{
    constructor(options){
        this.$el = options.el;
        this.$data = options.data;

        if(this.$el){
            // 数据劫持  给data中的属性添加get set方法。
            new Observer(this.$data);
            // 将劫持后的数据代理到this上。
            this.proxyData(this.$data);
            // 模板编译
            new Compile(this.$el,this);
        }
    }
    
    proxyData(data){
        Object.keys(data).forEach(key => {
            Object.defineProperty(this,key,{
                get(){
                    return data[key];
                },
                set(newValue){
                    data[key] = newValue;
                }
            })
        })
    }
}