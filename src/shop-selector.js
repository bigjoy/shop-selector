/**
 * 门店选择控件
 * 
 * @param divId 选择按钮div
 * @param province    按省查询信息
 * @param city 按市查询信息
 * @param recommendCity 推荐城市
 */

ShopSelector = function () {
    this.initialize.apply(this, arguments);
};

ShopSelector.prototype = {

    constructor:ShopSelector,

    /* 初始化 */

    initialize :function (options) {
        var id = options.id;
        this.selectDiv = $('#'+ id).get(0);
        this.callback = options.callback;
        //初始化时赋值
        this.citys = {}
        this.provinces = {}
        
        this.letters = [];
        this.hotCitys = []; 
        //初始化时对输入数据进行校验
        if(!options.data || !options.data instanceof Array || options.data.length == 0){
            console.log("门店数据不合法");
            return;
        }

		this.formatData(options.data);

        this.defaultTip = "城市名(支持汉字/拼音)";

        //this.shopData = this.provinces;		
        this.shopData = this.provinces;

		//绑定切换时的点击事件
        this.changeEvent();
    },

    /* 把输入的城市/省数据格式化成按字母排序的数组
    	input:  [{"福建|fujian":[{"福州|fuzhou|fz":[{"id":"111","name":"福州店1"},{"id":"112","name":"福州店2"}]},{"厦门|xiamen|xm":[{"id":"111","name":"厦门店1"},{"id":"122","name":"厦门店2"}]},{"三明|sanming|sm":[{"id":"131","name":"三明店1"},{"id":"132","name":"三明店2"}]}]},{"浙江|fujian":[{"福州|fuzhou|fz":[{"id":"111","name":"福州店1"},{"id":"112","name":"福州店2"}]},{"厦门|xiamen|xm":[{"id":"111","name":"厦门店1"},{"id":"122","name":"厦门店2"}]},{"三明|sanming|sm":[{"id":"131","name":"三明店1"},{"id":"132","name":"三明店2"}]}]}]}}]'
    	output:  {b:[{"广东":"[]"},{"广西":"[]"}],b:[{}]}
     */
    formatData: function(data){
        var allCitys = {};
        var allProvinces = {};
        var regExProvince = this.regExProvince;
        var regExCity = this.regEx;
        var cityNames = [];
        for(var i=0;i<data.length;i++){
            var provinceInfo = data[i];
            var province = {};
            for(var provinceName in provinceInfo){
                //判断当前省属于哪个字母开头
                var matchProvince = regExProvince.exec(provinceName);
                if(!matchProvince){
                    console.log("无法获取到匹配的省名");
                    continue;
                }
                var letterProvince = matchProvince[2];

                var citys = provinceInfo[provinceName];
                var provinceShops = [];
                //连接城市数组
                for(var j = 0;j<citys.length;j++){
                    var city = citys[j];
                    for(var cityName in city){
                        cityNames.push(cityName);
                        cityShops = city[cityName];

                        //默认当前店铺为第一家店，后续修改为单独设置接口
                        if(!this.curShop && cityShops.length >0){
                            this.curShop = cityShops[0];
                        }

                        var matchCity = regExCity.exec(cityName);
                        if(!matchCity){
                            console.log("无法获取到匹配的市名");
                            continue;
                        }
                        var letterCity = matchCity[3];

                        if(!allCitys[letterCity]){
                            allCitys[letterCity] = [];
                        }
                        allCitys[letterCity].push(city);
                        provinceShops = provinceShops.concat(cityShops);
                    }
                }
                province[provinceName] = provinceShops;

                if(!allProvinces[letterProvince]){
                    allProvinces[letterProvince] = [];
                }
                allProvinces[letterProvince].push(province);
            }
        }
        this.citys = allCitys;
        this.provinces = allProvinces;
        this.cityNames = cityNames;        
    },
   

//切换查询类型：按省查询和按市查询	
    changeQryType: function(type){
    	//生成按市查询或按省查询的
    	if(type == "city"){
            this.shopData = this.citys;
    	}
    	else{
            this.shopData = this.provinces;
    	}
        this.qryType = type;

        this.createShopHtml();
    },

// 获取当前类型
	getQryType : function(){
		return this.qryType;
	},

// 获取当前城市
	getCurrentShop: function(){
		return this.curShop;        
	},

    //触发控件隐藏
    hide : function(){
            $("#shopSelector").hide();
            $("#searchUl").hide();
            $("#cityInput").val(that.defaultTip);
            $("#searchButton").attr("disabled",true);  
    },

    /* *
     * @createWarp
     * 创建城市BOX HTML 框架
     * */

    createWarp:function(){
        var selectPos = this._m.getPos(this.selectDiv);
        var div = this.rootDiv = document.createElement('div');
        var that = this;

        // 设置DIV阻止冒泡
        this._m.on(that.rootDiv,'click',function(event){
            that._m.stopPropagation(event);
        });

        this._m.on(document, 'click', function (event) {
            event = that._m.getEvent(event);
            var target = that._m.getTarget(event);
            if(target == that.selectDiv){                
                return false;
            } 
            //console.log(target.className);
            $("#shopSelector").hide();
            $("#searchUl").hide();
            $("#cityInput").val(that.defaultTip);
            $("#searchButton").attr("disabled",true);            
            //if (that.ul)Vcity._m.addClass('hide', that.ul);
            
        });

        div.className = 'shopSelector';
        div.style.position = 'absolute';
        div.style.left = selectPos.left + 'px';
        div.style.top = selectPos.bottom + 'px';
        div.style.zIndex = 999998;
        div.id = "shopSelector"        

        var childdiv = this.shopBox = document.createElement('div');
        childdiv.className = 'shopBox';
        childdiv.id = 'shopBox';

        //title
        var titleDiv = document.createElement('div');
        titleDiv.id = "boxTitle";
        titleDiv.className = "contentDiv"
        $(titleDiv).append('<p class="tip">门店列表：</p>')
        $(childdiv).append(titleDiv);

        //生成热门城市
     	// var citys = this.citys;

        //   $(childdiv).append('<div><dl><dd><a href="#">全国</a><a href="#">北京</a><a href="#">南京</a><a href="#">福州</a></dd></dl></div>');   
        
        //生成查询条件(按省，按搜索栏 )
        var searchDiv = document.createElement("div");
        searchDiv.id = "searchShop";
        
        $(searchDiv).append('<input type="button" id = "byProvince" value="按省份">');
        $(searchDiv).append('<input type="button" id = "byCity" value="按城市">');
        $(searchDiv).append('<input type="text" class="cityinput" id="cityInput" value='+that.defaultTip+'>');
        $(searchDiv).append('<input type="button" id = "searchButton" value="搜索">');
        
        $(childdiv).append(searchDiv);

        //生成商店列表
        var hotShopDiv = document.createElement("div");
        hotShopDiv.id = "hotShop";
        hotShopDiv.className = "hotShop";
        $(childdiv).append(hotShopDiv);

        $(div).append(childdiv);
        $(document.body).append(div);
        
        //添加样式
        $("#searchShop input[type=button]").addClass("searchButton");
        $("#byProvince").addClass('selected');        
        $("#searchButton").attr('disabled',"true");

        that.input = $("#cityInput").get(0);
        
        $("#byProvince").click(function(event) {
            that.changeQryType("province");
            $("#byCity").removeClass('selected');
            $(this).addClass("selected");
        });

        $("#byCity").click(function(event) {
            that.changeQryType("city");
            $("#byProvince").removeClass('selected');
            $(this).addClass("selected");
        });       
        
        
        this.createShopHtml();

        this.inputEvent();
    },

    /* *
     * @create
     * TAB下面DIV：a,b,c分类HTML生成，DOM操作
     * {a:[{}]}
     **/
    /*<div><label></label> <dl>
		<dt>城市名/省名</dt>
		<dd>列表内容</dd>
		<dd>列表内容</dd>	
	</dl>
	 */
    createShopHtml:function(){
        var that = this;
        $("#cityTable").remove();
        $("#letterList").remove();
        var allLetterDiv,letterDiv,label,subData,shopData,odl,odt,odd,odda=[],str,key,ckey,sortKey,regEx = this.regEx,
               //修改类型时，要修改shopData指向的数据，而且两者结构应该一样
             shopData = this.shopData;
             sortKey=[];
         //显示指定字母的商店信息，或者显示所有的商店信息
         allLetterDiv =  document.createElement('div');          
         // 先设置全部隐藏hide
	     allLetterDiv.className = 'cityTab';
         allLetterDiv.id = "cityTable";

         for(key in shopData){
                
                sortKey.push(key);
                
            }
        sortKey.sort();

        //每个字母创建一个div，包括一个字母Label 和多个dl
        for(var i = 0;i<sortKey.length;i++){
        	var letter = sortKey[i];
        	letterDiv = this[letter] =  document.createElement('div');
            letterDiv.id = letter;
            letterDiv.className ="cityTab";        	   
        	
        	subData = shopData[letter];

        	for(var k = 0; k< subData.length ; k++){
                var district = subData[k];
	            odl = document.createElement('dl');
	            odt = document.createElement('dt');
	            odd = document.createElement('dd');
	            odda = [];
	            for(var districtName in district){
                    var shops = district[districtName];
                    
                    for(var j=0;j<shops.length;j++){
                        var shop = shops[j];
                        str = '<a href="javascript:void(0)" shopid='+shop.id+'>' + shop.name + '</a>';  
                        odda.push(str);
                    }
                    var match = this.regExProvince.exec(districtName)||this.regEx.exec(districtName)||["","非法名称"]
                   
	               odt.innerHTML = match[1]; 
                   odd.innerHTML = odda.join('');
                   odl.appendChild(odt);
                   odl.appendChild(odd);  

	            }

	            letterDiv.appendChild(odl);                

                if(k!=0){
                    $(odl).before("<label class='hideLetter'>"+letter.toLocaleUpperCase()+"</label>");
                }else{
                    $(odl).before("<label>"+letter.toLocaleUpperCase()+"</label>");    
                }
                

                
       		}
            allLetterDiv.appendChild(letterDiv);
        }
        
            $("#hotShop").append(allLetterDiv);

            //增加字母列表
            var str = "";
            for(var i = 0;i<sortKey.length;i++){
                str +='<a name='+sortKey[i]+' href="javascript:void(0)">'+sortKey[i].toLocaleUpperCase()+'</a>'
            } 

            var titleDiv = document.createElement('div');
            titleDiv.id = "letterList";
            titleDiv.className = "letterList";
            $(titleDiv).html(str);
            $("#searchShop").append(titleDiv);
            
            //绑定字母单击事件
            $("#letterList a").click(function(event){
                $("#cityTable div").hide();
                var name = this.name;
                $("#"+name).show();
            });

            //绑定店名单击事件
            $("dd a").click(function(event){
                that.curShop = {id:$(this).attr("shopid"),name:$(this).html()};
                $("#shopSelector").hide();

                 //调用回调函数
                 that.callback(that.curShop);
            });            
        // this.tabChange();
        // this.linkEvent();
        },

   /* *
     *  tab按字母顺序切换
     *  @ tabChange
     * */
    inputEvent: function(){
        //搜索框下拉框
        var that = this;
        var searchUlDiv = document.createElement('div');
        var inputPos = that._m.getPos($("#cityInput").get(0));        
        searchUlDiv.id = "searchUl";
        searchUlDiv.style.position = 'absolute';
        searchUlDiv.style.left = inputPos.left + 'px';
        searchUlDiv.style.top = inputPos.bottom + 'px';
        searchUlDiv.style.zIndex = 999999;        
        $("#shopSelector").after(searchUlDiv);
        that.searchUlDiv = searchUlDiv;
        $(searchUlDiv).hide();

        // 设置DIV阻止冒泡
        that._m.on(that.searchUlDiv,'click',function(event){
            that._m.stopPropagation(event);
        });

        
        $("#cityInput").focus(function(){ 
            if(this.value == that.defaultTip){
            this.value = '';
            } 
        });        
        $("#cityInput").blur(function(){
            if(this.value == that.defaultTip) {
                this.value = '';
            }
        });

        $("#cityInput").keyup(function(event) {
            event = event || window.event;
            var keycode = event.keyCode;
            that.createUl();

            // 下拉菜单显示的时候捕捉按键事件
            if(that.ul && !$(that.ul).is(":hidden") && !that.isEmpty){
                that.KeyboardEvent(event,keycode);
            }
        });

        $("#searchButton").click(function(){
            
            $("#byProvince").removeClass('selected');
            $("#byCity").addClass('selected');
            var cityName = that.input.shop || "无商店信息";
            var match = that.regEx.exec(cityName);
            if(!match){
                console.log("无法获取到匹配的城名");
                return;
                }

            var letter = match[3];
            var newShopData = {};
            var citys = that.citys[letter];
            for(var i=0;i<citys.length;i++){
                for(var name in citys[i]){
                    if(cityName == name){
                        newShopData[letter] = [citys[i]];
                    }
                }                
            }            
            that.shopData = newShopData;
            that.createShopHtml();

        });
    },
    
    /* *
     * 城市LINK事件
     *  @linkEvent
     * */

    linkEvent:function(){
        var links = this._m.$('a',this.hotShop);
        var that = this;
        for(var i=0,n=links.length;i<n;i++){
            links[i].onclick = function(){
                that.input.value = this.innerHTML;
                this._m.addClass('hide',that.shopBox);               
            }
        }
    },

    /* *
     * 点击切换商铺事件
     * @clickEvent
     * */

    changeEvent:function(){
        var that = this;
        this._m.on(this.selectDiv,'click',function(event){
            event = event || window.event;
            //不存在时创建，隐藏则显示
            if(!that.shopBox){
                that.createWarp();
            }else if(!!that.shopBox ){
                // slideul 不存在或者 slideul存在但是是隐藏的时候 两者不能共存                
                that.shopData = that.provinces;
                $("#byProvince").addClass('selected');
                $("#byCity").removeClass('selected');

                that.createShopHtml();
                that.input.value = that.defaultTip;
                $("#searchButton").attr("disabled",true);
                $("#shopSelector").toggle();
            }
        });
    },


     /* *
     * 生成下拉选择列表
     * @ createUl
     * */

    createUl:function () {
        //console.log('createUL');
        $("#searchUl").show();
        var str;
        var that = this;
        var value = this._m.trim(this.input.value);
        // 当value不等于空的时候执行
        if (value !== '') {
            var reg = new RegExp("^" + value + "|\\|" + value, 'gi');
            // 此处需设置中文输入法也可用onpropertychange
            var searchResult = [];
            for (var i = 0, n = this.cityNames.length; i < n; i++) {
                var cityName = this.cityNames[i];
                if (reg.test(cityName)) {
                    var match = that.regEx.exec(cityName);
                    if(!match){
                        console.log("无法获取到匹配城市名");
                        continue;
                    }
                    if (searchResult.length !== 0) {
                        str = '<li name='+cityName+'><b class="cityname">' + match[1] + '</b><b class="cityspell">' + match[2] + '</b></li>';
                    } else {
                        str = '<li  name='+cityName+' class="on"><b class="cityname">' + match[1] + '</b><b class="cityspell">' + match[2] + '</b></li>';
                    }
                    searchResult.push(str);
                }
            }
            this.isEmpty = false;
            // 如果搜索数据为空
            if (searchResult.length == 0) {
                this.isEmpty = true;
                str = '<li class="empty">对不起，没有找到数据 "<em>' + value + '</em>"</li>';
                searchResult.push(str);

                $("#searchButton").attr("disabled",true);
            }
            // 如果slideul不存在则添加ul
            if (!this.ul) {
                var ul = this.ul = document.createElement('ul');
                ul.className = 'cityslide';
                ul.id = "shopSlide"
                $("#searchUl").append(ul);
                // 记录按键次数，方向键
                this.count = 0;
            } else {
                this.count = 0;
                $(this.ul).show();
            }
            this.ul.innerHTML = searchResult.join('');
            
            // 绑定Li事件
            this.liEvent();
        }else{
            $("#searchUl").hide();        
        }
    },

    /* *
     * 特定键盘事件，上、下、Enter键
     * @ KeyboardEvent
     * */

    KeyboardEvent:function(event,keycode){
        var lis = this._m.$('li',this.ul);
        var len = lis.length;
        switch(keycode){
            case 40: //向下箭头↓
                this.count++;
                if(this.count > len-1) this.count = 0;
                for(var i=0;i<len;i++){
                    this._m.removeClass('on',lis[i]);
                }
                this._m.addClass('on',lis[this.count]);
                break;
            case 38: //向上箭头↑
                this.count--;
                if(this.count<0) this.count = len-1;
                for(i=0;i<len;i++){
                    this._m.removeClass('on',lis[i]);
                }
                this._m.addClass('on',lis[this.count]);
                break;
            case 13: // enter键
                this.input.value = this.regExChiese.exec(lis[this.count].innerHTML)[0];
                this.input.shop = $(lis[this.count]).attr("name"); 
                $("#searchButton").removeAttr('disabled');           
                $(this.ul).hide();
                break;
            default:
                break;
        }
    },



    /* *
     * 下拉列表的li事件
     * @ liEvent
     * */

    liEvent:function(){
        var that = this;
        var lis = this._m.$('li',this.ul);
        
        for(var i = 0,n = lis.length;i < n;i++){
            this._m.on(lis[i],'click',function(event){                
                event = that._m.getEvent(event);
                var target = that._m.getTarget(event);
                if(!that.isEmpty){
                   that.input.value = that.regExChiese.exec(target.innerHTML)[0];                
                   that.input.shop = $(target).attr("name"); 
                   $("#searchButton").removeAttr('disabled');                   
                 }else{
                    that.input.value = that.defaultTip;                    
                 }
                 $(that.ul).hide();

            });
            that._m.on(lis[i],'mouseover',function(event){
                event = that._m.getEvent(event);
                var target = that._m.getTarget(event);
                $(target).addClass('on');
            });
            that._m.on(lis[i],'mouseout',function(event){
                event = that._m.getEvent(event);
                var target = that._m.getTarget(event);
                $(target).removeClass('on',target);
            })
        }
    },

    /* *
	 * 静态方法集
	 * @name _m
	 * */
	_m : {
	    /* 选择元素 */
	    $:function (arg, context) {
	        var tagAll, n, eles = [], i, sub = arg.substring(1);
	        context = context || document;
	        if (typeof arg == 'string') {
	            switch (arg.charAt(0)) {
	                case '#':
	                    return document.getElementById(sub);
	                    break;
	                case '.':
	                    if (context.getElementsByClassName) return context.getElementsByClassName(sub);
	                    tagAll = this.$('*', context);
	                    n = tagAll.length;
	                    for (i = 0; i < n; i++) {
	                        if (tagAll[i].className.indexOf(sub) > -1) eles.push(tagAll[i]);
	                    }
	                    return eles;
	                    break;
	                default:
	                    return context.getElementsByTagName(arg);
	                    break;
	            }
	        }
	    },
	   
	    /* 绑定事件 */
	    on:function (node, type, handler) {
	        node.addEventListener ? node.addEventListener(type, handler, false) : node.attachEvent('on' + type, handler);
	    },

	    /* 获取事件 */
	    getEvent:function(event){
	        return event || window.event;
	    },

	    /* 获取事件目标 */
	    getTarget:function(event){
	        return event.target || event.srcElement;
	    },

	    /* 获取元素位置 */
	    getPos:function (node) {
	        var scrollx = document.documentElement.scrollLeft || document.body.scrollLeft,
	                scrollt = document.documentElement.scrollTop || document.body.scrollTop;
	        var pos = node.getBoundingClientRect();
	        return {top:pos.top + scrollt, right:pos.right + scrollx, bottom:pos.bottom + scrollt, left:pos.left + scrollx }
	    },

	    /* 添加样式名 */
	    addClass:function (c, node) {
	        if(!node)return;
	        $(node).addClass(c)
	    },

	    /* 移除样式名 */
	    removeClass:function (c, node) {
	        if(!node)return;
            $(node).removeClass(c)
	    },

	    /* 是否含有CLASS */
	    hasClass:function (c, node) {
	        if(!node || !node.className)return false;
	        return node.className.indexOf(c)>-1;
	    },

	    /* 阻止冒泡 */
	    stopPropagation:function (event) {
	        event = event || window.event;
	        event.stopPropagation ? event.stopPropagation() : event.cancelBubble = true;
	    },
	    /* 去除两端空格 */
	    trim:function (str) {
	        return str.replace(/^\s+|\s+$/g,'');
	    }
	},



	/* 正则表达式 筛选中文城市名、拼音、首字母 */
	regEx : /^([\u4E00-\u9FA5\uf900-\ufa2d]+)\|(\w+)\|(\w)\w*$/i,
	regExProvince : /^([\u4E00-\u9FA5\uf900-\ufa2d]+)\|(\w)\w*$/i,
	regExChiese : /([\u4E00-\u9FA5\uf900-\ufa2d]+)/,


	/* *
	 * 格式化城市数组为对象oCity，按照a字母顺序分组：
	 * {a:[{"安徽":[{name:"店1",id:1}]},{},{}],b:[]}}
	 * */


	/* 城市HTML模板 */
	_template : [
	    '<p class="tip">城市列表</p>',
	    '<ul>',
	    '<li class="on">热门城市</li>',
	    '<li>ABCDEFGH</li>',
	    '<li>IJKLMNOP</li>',
	    '<li>QRSTUVWXYZ</li>',
	    '</ul>'
	]
};
