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
            if (typeof data != 'undefined' && data !== []) {
                this.tvlist = data;
            } else {
                this.tvlist = myinfo;
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
                        my.type = tv.type;
                        if (tv.type == 'youtube') {
                            if (typeof response.data.pageInfo.totalResults != 'undefined') {
                                response.data.items.forEach(function (i, index) {
                                    if (typeof i.contentDetails.videoPublishedAt != 'undefined') {
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
                        } else if (tv.type == 'bilibili') {
                            if (typeof response.data.status == 'boolean') {
                                if (response.data.data.vlist) {
                                    response.data.data.vlist.forEach(function (i, index) {
                                        var date = new Date(i.created*1000);
                                        var publishtime = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
                                        var item = {
                                            videoId: i.aid,
                                            img: 'http:'+i.pic,
                                            title: i.title,
                                            description: i.description,
                                            publishtime: publishtime
                                        };
                                        tv.items.push(item);
        	                        });
                                    tv.page = tv.page > 0 ? tv.page + 1 : 2;
                                } else {
                                    tv.more = false;
                                }
                            } else {
                                alert('無此 bilibili 播放列表');
                            }
                        }

                        app.onloading();
                    })
                    .catch(function (error) {
                        //console.log(error);
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
                            if (my.type == 'youtube') {
                                if (typeof response.data.items[0].snippet.title != 'undefined') {
                                    var item = app.getemptyitem();
                                    item.id = id;
                                    item.title = response.data.items[0].snippet.title;
                                    item.type = 'youtube';
                                    app.tvlist.push(item);
                                    app.save();
                                } else {
                                    alert('無此 Youtube 播放列表');
                                }
                            } else if (my.type == 'bilibili') {
                                if (typeof response.data.data == 'object') {
                                    var item = app.getemptyitem();
                                    item.id = id;
                                    item.title = response.data.data.name;
                                    item.type = 'bilibili';
                                    app.tvlist.push(item);
                                    app.save();
                                } else {
                                    alert('無此 bilibili 播放列表');
                                }
                            }
                            app.newtv = '';
                            app.onloading();
                        })
                        .catch(function (error) {
                            //console.log(error);
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
    var urlArr = url.split("bilibili.com/");
    if (urlArr.length == 2) {
        var urlArr2 = urlArr[1].split("#!");
        if (urlArr.length > 0) {
            id = urlArr2[0].replace('/', '');
            my.type = 'bilibili';
        }
    } else {
        urlArr = url.split("playlist?list=");
        if (urlArr.length == 2) {
            id = urlArr[1];
            my.type = 'youtube';
        }
    }

    return id;
}

function getapiurl(id, type, page) {
    var url = '';
    var pagesize = 10;
    if (type == 'bilibili_playlist') {
        url = './api/?id='+id+'&type=bilibili&c=info';
    } else if (type == 'bilibili_playlistitems') {
        if (page == '') {
            page = 1;
        }
        url = './api/?id='+id+'&type=bilibili&c=items&page='+page;
    } else if (type == 'youtube_playlist') {
        url = 'https://www.googleapis.com/youtube/v3/playlists?part=snippet&id='+id+'&key='+ my.youtube_api_key;
    } else if (type == 'youtube_playlistitems') {
        url = 'https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails,snippet&playlistId='+id+'&maxResults='+pagesize+'&key='+ my.youtube_api_key;
        if (page != '') {
            url += '&pageToken=' + page;
        }
    }

    return url;
}

