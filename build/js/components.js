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
                    <a class="update" @click="editsave(data)">&nbsp;<i class="fa fa-check" aria-hidden="true"></i>&nbsp;</a>\
                    <a class="cancel" @click="editdisplay(data)">&nbsp;<i class="fa fa-close" aria-hidden="true"></i>&nbsp;</a>\
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
