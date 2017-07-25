<?php
if(!isset($_SERVER['HTTP_REFERER'])){ exit; }
if(!strpos($_SERVER['HTTP_REFERER'], '//hsin.tw/tv')){ exit; }

require_once './lib/Requests/Requests.php';
Requests::register_autoloader();

$pagesize = 10;

$id = $_GET['id'];//'26666749';
$type = $_GET['type'] == 'bilibili' ? 'bilibili' : 'youtube';// bilibili, youtube
$c = $_GET['c'] == 'info' ? 'info' : 'items';// info, items

if (!preg_match('/[a-zA-Z0-9_\-]{1,}/', $id)) {
    exit;
}

if ($c == 'info') {
    $url = 'http://space.bilibili.com/ajax/member/GetInfo';
    $request = Requests::post($url, array(), array('csrf' => '', 'mid' => $id));
} else if ($c == 'items') {
    $page = $_GET['page'];//1;
    if (!preg_match('/[a-zA-Z0-9_\-]{1,}/', $page)) {
        exit;
    }
    $url = getTvItems($id, $pagesize, $page);
    $request = Requests::get($url, array('Accept' => 'application/json'));
}

header('Content-Type: application/json; charset=utf-8');
echo $request->body;

function getTvItems($id, $pagesize, $page) {
    return 'http://space.bilibili.com/ajax/member/getSubmitVideos?mid='.$id.'&pagesize='.$pagesize.'&tid=0&page='.$page.'&keyword=&order=pubdate';
}
