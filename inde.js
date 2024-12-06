watch(() => videoList.value, (newVal) => {
    videoListWithPinyin = videoList.value!.map(folder => ({
        ...folder,
        folderSearchName: pinyin(folder.folderName, { style: 0 }).flat().join(''),
        folderSearchNameFl: pinyin(folder.folderName, { style: 4 }).flat().join(''),
        romoji: wanakana.isJapanese(folder.folderName) ? wanakana.toRomaji(folder.folderName) : '',
        list: folder.list.map(video => ({
            ...video,
            titleSearchName: pinyin(video.title, { style: 0 }).flat().join(''),
            titleSearchNameFl: pinyin(video.title, { style: 4 }).flat().join(''),
            otherNameSearchName: video.otherName.split(",").map(item => pinyin(item, { style: 0 }).flat().join('')),
            otherNameSearchNameFl: video.otherName.split(",").map(item => pinyin(item, { style: 4 }).flat().join('')),
            romojiTitle: wanakana.isJapanese(video.title) ? wanakana.toRomaji(video.title) : '',
            romojiOtherName: video.otherName.split(",").map(item => wanakana.isJapanese(item) ? wanakana.toRomaji(item) : ''),
        }))
    }));
}, { deep: true })

const searchInputFn =  () => {
    // first_letter
    const searchKey = pinyin(searchInput.value, { style: 0 }).flat().join('')
    const allVideo = videoListWithPinyin.flatMap(folder =>
        folder.list.map(video => ({
            ...video,
            folderName: folder.folderName
        }))
    );
    switch (searchTypeid.value) {
        case "folder":
            const fuse = new Fuse(videoListWithPinyin, {
                threshold: 0.1,
                keys: [
                    'folderSearchName', 'folderSearchNameFl', 'romoji'
                ]
            })
            viewVidoListWithPinyin.value = fuse.search(searchKey).map(i => i.item)
            break;
        case "title":
            const fuse2 = new Fuse(allVideo, {
                threshold: 0.1,
                keys: [
                    "titleSearchName", "titleSearchNameFl", "romojiTitle"
                ]
            })
            viewVidoListWithPinyinOther.value = fuse2.search(searchKey).map(i => i.item)
            break;
        case "otherName":
            const fuse3 = new Fuse(allVideo, {
                threshold: 0.1,
                keys: [
                    "otherNameSearchName", "otherNameSearchNameFl", "romojiOtherName"
                ]
            })
            viewVidoListWithPinyinOther.value = fuse3.search(searchKey).map(i => i.item)
            break;
    }
}


const imageBase64 = await bufferToBase64(cover)
await db.videos.update(id, {
    coverPath: imageBase64 as string
})
videoList.value![0].list[0].coverPath = imageBase64 as string
const videoBlob = new Blob([video], { type: 'video/mp4' });
await db.videos_data.add({
    id,
    data: videoBlob
})
nextTick(() => {
    searchInputFn()
})
loadingVideoId.value = 0
loadingVideoFolderId.value = 0