Vue.component('itemsbox',{
    props:['data'],
    data: function () {
        return { title: this.data.title }
    },
    template: '\
    <div :id="data.id+\'box\'" class="itemsbox" v-show="data.displayitemsbox">\
        <header>\
            <div v-if="data.editdisplay">\
                    <input class="title" type="text" name="title" v-model:value="title" v-on:keyup.enter="editsave(data)" />\
                    <button class="update" @click="editsave(data)">更新</button>\
                    <button class="cancel" @click="editdisplay(data)">取消</button>\
            </div>\
            <div v-else>\
                <div class="edit">\
                    <a href="#" v-on:click="editdisplay(data)"><i class="fa fa-edit" aria-hidden="true"></i></a>\
                </div>\
                <h2>\
                    <a href="#" v-on:click="editdisplay(data)">{{data.title}}</a>\
                </h2>\
            </div>\
        </header>\
        <div class="items">\
            <tvitem :i="item" v-for="item in data.items" :key="item.videoId"></tvitem>\
        </div>\
        <div class="more">\
            <a v-if="data.more" href="#" @click="gettvitems(data)">更多...</a>\
            <div v-else class="end">沒有了</div>\
        </div>\
    </div>\
    ',
    methods: {
        gettvitems: function(data) {
            this.$emit('gettvitems', data);
        },
        editdisplay: function(data) {
            this.title = data.title;
            this.$emit('editdisplay', data);
        },
        editsave: function(data) {
            if (this.title != '') {
                this.$emit('editsave', data, this.title);
            }
        }
    },
});

Vue.component('tvitem', {
    props:['i'],
    template: '\
    <article class="item">\
        <div class="thumb">\
            <a :href="\'https://www.youtube.com/watch?v=\' + i.videoId" target="_blank">\
                <img :src="i.img" :title="i.title" :alt="i.title">\
            </a>\
        </div>\
        <div class="info">\
            <div class="title">\
                <a :href="\'https://www.youtube.com/watch?v=\' + i.videoId" target="_blank">{{i.title}}</a>\
            </div>\
            <div class="description">\
                <a :href="\'https://www.youtube.com/watch?v=\' + i.videoId" target="_blank">{{i.description}}</a>\
            </div>\
            <div class="publishtime">發佈時間：{{i.publishtime}}</div>\
        </div>\
        <div class="clear"></div>\
    </article>\
    '
});


var app = new Vue({
    el: '#root',
    data: {
        showHome: true,
        showsidebar: true,
        loading: true,
        mobilemode: false,
        newtv: "",
        tvlist: [],
    },
    mounted() {
        if (this.$el.clientWidth < 1200) {
            this.showsidebar = false;
            this.mobilemode = true;
        }
        
        this.loading = false;
    },
    created(){        
        if (store.enabled) {
            //store.clear();
            var data = store.get('data');
            if (data !== undefined && data !== []) {
                this.tvlist = data;
            } else {
                this.tvlist = [{
                    id: "PLKOpTKkFrTy_nX9SHIKMHXogoJnvf9cLi",
                    title: "綜藝玩很大全集",
                    type: "youtube",
                    items:[],
                    page:'',
                    displayitemsbox: false,
                    more: true,
                    deletetvdisplay: false,
                    editdisplay: false,
                    init:false
                }];
            }
        } else {
            alert('瀏覽器不支援本地儲存，無法正常運作。');
        }
    },
	methods:{
    	// 取得初始化的 tv item
    	getemptyitem: function() {
        	return {
                    id: "",
                    title: "",
                    type: "youtube",
                    items:[],
                    page:'',
                    displayitemsbox: false,
                    more: true,
                    deletetvdisplay: false,
                    editdisplay: false,
                    init:false
            };
    	},
    	// 讀取中
    	onloading: function() {
        	this.loading = !this.loading;
    	},
    	sidebarmove: function() {
        	this.showsidebar = !this.showsidebar;
        	this.canceldeletetv();
    	},
    	// 顯示首頁
    	homedisplay: function() {
        	if (!this.loading) {
                if (this.mobilemode) {
                    this.showsidebar = false;
                }

        	    this.showHome = true;
                this.tvlist.forEach(function (i, index) {
                	i.displayitemsbox = false;
        	    });
        	}
    	},
    	// 取得播放列表
    	gettvitems: function(tv) {
        	if (!this.loading) {
                if (this.mobilemode) {
                    this.showsidebar = false;
                }

        	    this.onloading();

                axios.get(getapiurl(tv.id, tv.type+'_playlistitems', tv.page))
                    .then(function (response) {
                        if (response.data.pageInfo.totalResults !== undefined) {
                            response.data.items.forEach(function (i, index) {
                                if (i.contentDetails.videoPublishedAt !== undefined) {
                                    var item = {
                                        videoId: i.contentDetails.videoId,
                                        img: i.snippet.thumbnails.default.url,
                                        title: i.snippet.title,
                                        description: i.snippet.description,
                                        publishtime: i.contentDetails.videoPublishedAt.substr(0,10)
                                    };
                                    tv.items.push(item);
                                }
        	                });
                
                            if (typeof response.data.nextPageToken == 'string') {
                                tv.page = response.data.nextPageToken;
                            } else {
                                tv.more = false;
                            }
                
                        } else {
                            alert('無此 Youtube 播放列表');
                        }
                        app.onloading();
                    })
                    .catch(function (error) {
                        alert(error);
                        app.onloading();
                    });
            }
    	},
    	// 顯示播放列表
    	tvlistdisplay: function(item, index) {
        	this.showHome = false;
        	this.canceldeletetv();
        	
            this.tvlist.forEach(function (i, index) {
            	i.displayitemsbox = false;
        	});
            item.displayitemsbox = true;
            
            if (!item.init) {
                item.init = true;
                this.gettvitems(item);
            }

            if (this.mobilemode) {
                this.showsidebar = false;
            }

    	},
    	// 新增播放列表 tv
        newtvsubmit: function(){
            if (this.newtv != '' && !this.loading) {
                var id = parseid(this.newtv);                
                if (id != '') {
                	this.onloading();
                    axios.get(getapiurl(id, my.type+'_playlist', ''))
                        .then(function (response) {
                            if (response.data.items[0].snippet.title !== undefined) {
                                var item = app.getemptyitem();
                                item.id = id;
                                item.title = response.data.items[0].snippet.title;
                                item.type = 'youtube';
                                app.tvlist.push(item);
                                app.save();
                            } else {
                                alert('無此 Youtube 播放列表');
                            }
                            app.newtv = '';
                            app.onloading();
                        })
                        .catch(function (error) {
                            //console.log(error);
                            alert(error);
                            app.onloading();
                        });
                } else {
                    alert('無效的網址，請參考首頁關於可使用的網址說明');
                }
            }
        },
        // 排序後
        onSortUpdate: function() {
            this.save();
        },
        // 顯示:刪除 tv 的確認框
        deletetv: function(item, index) {
            this.canceldeletetv();
            item.deletetvdisplay = true;
        },
        // 取消:刪除 tv 的確認框, 修改標題的輸入框
        canceldeletetv: function() {
            this.tvlist.forEach(function (i, index) {
            	i.deletetvdisplay = false;
            	i.editdisplay = false;
                //Vue.set(this.tvlist, index, i);
        	});
        },
        // 刪除 tv
        removetv: function(index) {
            if (this.tvlist[index].displayitemsbox) {
                this.showHome = true;
            }
            this.tvlist.splice(index, 1);
            //Vue.delete(this.tvlist, index);
            this.save();
        },
        // 顯示:編輯 tv title 的輸入框
        editdisplay: function(tv) {
            tv.editdisplay = !tv.editdisplay;
        },
        // 儲存 tv title 的修改
        editsave: function(tv, title) {
            tv.title = title;
            tv.editdisplay = false;
            this.save();
        },
        // 儲存 tv 列表
        save: function() {
            if (store.enabled) {
                var data = [];
                this.tvlist.forEach(function (i, index) {
                    var empty = app.getemptyitem();
                    empty.id = i.id;
                    empty.title = i.title;
                    empty.type = i.type;
                	data.push(empty);
                });
                store.set('data',data);
                //alert('saved');
            } else {
                alert('無法儲存');
            }
        }
    }
})

var my = {
    type : 'youtube',
    youtube_api_key : 'AIzaSyAwJaN5lp7CeGIc02s8h77ygCPRESHUI6E',
}

function parseid(url) {
    var id = '';
    // bilibili http://space.bilibili.com/8739849/#!/video
    var urlArr = url.split("bilibili.com/");
    if (urlArr.length == 2) {
        var urlArr2 = urlArr[1].split("/");
        if (urlArr.length > 0) {
            id = urlArr2[0];
            my.type = 'bilibili';
        }
    } else {
        // youtube https://www.youtube.com/playlist?list=PLKOpTKkFrTy_nX9SHIKMHXogoJnvf9cLi
        urlArr = url.split("playlist?list=");
        if (urlArr.length == 2) {
            id = urlArr[1];
            my.type = 'youtube';
        }
    }

    return id;
}

function checkid(id) {
    var name = '';
    
    // bilibili http://space.bilibili.com/ajax/member/GetInfo?csrf=&mid=8739849
    var url = 'http://space.bilibili.com/ajax/member/GetInfo';
    axios.post(url, {
    csrf: '',
    mid: id
    })
    .then(function (response) {
        console.log(response);
    })
    .catch(function (error) {
        console.log(error);
    });
    
    return name;
}

function getapiurl(id, type, page) {
    var url = '';
    var pagesize = 10;
    if (type == 'bilibili') {
//        http://space.bilibili.com/ajax/member/getSubmitVideos?mid=26666749&pagesize=30&tid=0&page=2&keyword=&order=pubdate

        url = 'http://space.bilibili.com/ajax/member/getSubmitVideos?mid='+id+'&pagesize=30&tid=0&page='+page+'&keyword=&order=pubdate';
    } else if (type == 'youtube_playlist') {
//      https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=PLKOpTKkFrTy_nX9SHIKMHXogoJnvf9cLi%2CPLyYlLs02rgBYRWBzYpoHz7m2SE8mEZ68w&key=AIzaSyAwJaN5lp7CeGIc02s8h77ygCPRESHUI6E
        url = 'https://www.googleapis.com/youtube/v3/playlists?part=snippet&id='+id+'&key='+ my.youtube_api_key;
    } else if (type == 'youtube_playlistitems') {
//      https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails,snippet&playlistId=PLKOpTKkFrTy_nX9SHIKMHXogoJnvf9cLi&maxResults=10&key=AIzaSyAwJaN5lp7CeGIc02s8h77ygCPRESHUI6E
        url = 'https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails,snippet&playlistId='+id+'&maxResults='+pagesize+'&key='+ my.youtube_api_key;
        if (page != '') {
            url += '&pageToken=' + page;
        }
    }

    return url;
}



