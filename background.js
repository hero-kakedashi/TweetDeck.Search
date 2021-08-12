'use strict';

{

  // TweetDeckが開いているかを確認する関数
  // 引数：なし
  // 返却値：tweetdeckのタブID
  function is_openning_tweetdeck() {
    return new Promise((resolve, reject) => {
        try {
          chrome.tabs.query({}, tabs => {
            var tweetdeck_tab_id = -1;
            for(let i=0; i<tabs.length; i++){
              //console.log(tabs[i].title);
              //console.log(tabs[i].url);
              if (String(tabs[i].url) == "https://tweetdeck.twitter.com/") {
                tweetdeck_tab_id = tabs[i].id;
                break;
              }
            }
            resolve(tweetdeck_tab_id);
          });
        } catch (e) {
          reject(e);
        }
    })
  }

  function print_value(value_str) {
    console.log(value_str);
  }

  // TweetDeckを開く関数
  // 引数：TweetDeckのタブID(既存で開いていない場合は-1)
  // 返却値：TweetDeckのタブID
  function open_tweetdeck(tweetdeck_tab_id) {
    //console.log(tweetdeck_tab_id);
    if (tweetdeck_tab_id == -1){
      return new Promise((resolve, reject) => {
        chrome.tabs.create({
          active: false,
          url: "https://tweetdeck.twitter.com/"
        }, tab => {
          //console.log(tab.id);
          resolve(tab.id);
        });
      });
    }
    return new Promise((resolve, reject) => {
       resolve(tweetdeck_tab_id);
    });
  }

  // TweetDeckにカラムを追加する関数
  // 引数(search_text)：キーワード
  // 引数(tab_id)：TweetDeckのタブID
  // 返却値：なし
  function add_tweetdeck_column(search_text, tab_id){
    //console.log(search_text);
    //chrome.tabs.move(tab_id);

    // TweetDeckのタブを開く
    chrome.tabs.update(tab_id, {selected: true});

    // TweetDeckのタブにおいて、カラムを追加する
    chrome.tabs.executeScript(
        tab_id,
        {
          code: `document.getElementsByClassName("js-header-action js-show-tip app-search-fake padding-al margin-bm")[0].click();
          document.getElementsByClassName("js-app-search-input search-input is-focused")[0].value = "${search_text}";
          //const event = new KeyboardEvent("keypress", {
          //  view: window,
          //  keyCode: 13,
          //  bubbles: true,
          //  cancelable: true
          //});
          //document.querySelector("input").dispatchEvent(event);
        `}
      );
  }

  // メニュー追加
  chrome.runtime.onInstalled.addListener(() => {
    //var context = "all";
    const parent = chrome.contextMenus.create({
      id: 'parent',
      title: 'TweetDeckで検索',
      "contexts" : ["selection"] // テキスト上で右クリックされた場合のメニューに追加
    });
  });

  // メニューをクリック時に実行
  chrome.contextMenus.onClicked.addListener(item => {

    // フォーカスされた文字列を取得
    var select_text = item.selectionText;

    // TweetDeckが開いているかを確認
    is_openning_tweetdeck()
    .then(function (tweetdeck_tab_id) {
      // TweetDeckを開く(開いていない場合)
      open_tweetdeck(tweetdeck_tab_id).then(function (tab_id) {
        // TweetDeckにカラムを追加
        add_tweetdeck_column(select_text, tab_id);
      });
    });
  });
}
