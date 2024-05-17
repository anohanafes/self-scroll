
## Self-scroll

##目的：
* 为了实现一个可兼容IE,Chrom,FF浏览器的自定义滚动条

##有问题反馈
这是我在 NPM上 的第一个插件，希望各位大佬在使用中有任何问题及性能优化建议，欢迎反馈给我，可以用以下联系方式跟我交流，感谢！

* 邮件(519855937#qq.com, 把#换成@)
* 微信:wqn30303
* QQ: 519855937

##tips：

在兴趣的驱动下,写一个`免费`的东西，有欣喜，也还有汗水，希望你喜欢我的作品，同时也能支持一下。

##关于作者

```javascript
var author = {
  nickName:"王秋宁",
  direction:"一个平平无奇的小前端~~~~"
}
```

##关于使用

* jq 项目中，可以直接 npm install 下载下来后，引入 xxx/index-static.js：

```javascript
直接在 index.html 引用 (详请见 demo-index-static.html)：
html部分：
 
 ......

js部分：
<script src='xxx/self-scroll/index-static.js'></script>
<script>
    /**
     * @param pNode 目标元素的父元素（需添加滚动条的元素）
     * @param cNode 超宽元素（一般所有内容都放在这个元素下）
     * @param scrollOption 滚动条配置 (注意：不需要设置主体元素 和 背景元素的高！！！因为 主体元素 是等同于 pNode 的高，背景元素的高应该是根据 pNode 在 cNode 中的占比动态计算):
                1.如果给滚动条主体元素加样式 --- c_ {css样式名}：css样式值;
                2.如果给滚动条背景元素加样式 --- p_ {css样式名}：css样式值;
    */

    例：

    let pNode = ... ;
    let cNode = ... ;

    let scrollOption = {
        p_width:"10px",
        c_width:"10px",
        p_background:"red",
        c_background:"blue",
    };
    
    let _Scroll = new Scroll(pNode,cNode,scrollOption);

    _Scroll.init();
</script>
```


* MVVM框架 项目中，npm install self-scroll

```javascript
js部分：
<script>
    import {Scroll} from 'self-scroll';

    以 VUE 为例：

    /**
     * @param pNode 目标元素的父元素（需添加滚动条的元素）
     * @param cNode 超宽元素（一般所有内容都放在这个元素下）
     * @param scrollOption 滚动条配置 (注意：不需要设置主体元素 和 背景元素的高！！！因为 主体元素 是等同于 pNode 的高，背景元素的高应该是根据 pNode 在 cNode 中的占比动态计算):
                1.如果给滚动条主体元素加样式 --- c_ {css样式名}：css样式值;
                2.如果给滚动条背景元素加样式 --- p_ {css样式名}：css样式值;
    */

    例：

    let pNode = ... ;
    let cNode = ... ;
    
    let scrollOption = {
        p_width:"10px",
        c_width:"10px",
        p_background:"red",
        c_background:"blue",
    };
    
    let _Scroll = new Scroll(pNode,cNode,scrollOption);

    _Scroll.init();
</script>
```