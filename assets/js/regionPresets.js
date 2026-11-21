// 地区预设模块
const regionTemplates = {
  "China (Mainland)": [
    "下一站：XX站",
    "本次列车开往XX方向",
    "请站稳扶好",
    "文明乘车 先下后上"
  ],
  "China (HK, Macau, Taiwan)": [
    "下一站：XX站",
    "本班列车开往XX",
    "請小心月台空隙",
    "請讓有需要人士優先"
  ],
  "UK / USA": [
    "Next Stop: XX Station",
    "This train is bound for XX",
    "Mind the gap",
    "Please give up your seat"
  ]
};
let currentRegion = localStorage.getItem("ledSimRegion") || "China (Mainland)";

function setRegion(regionName) {
  currentRegion = regionName;
  localStorage.setItem("ledSimRegion", regionName);
  renderTemplateList(regionTemplates[regionName]);
}
function renderTemplateList(list) {
  const container = document.getElementById("templateList");
  if (!container) return;
  container.innerHTML = "";
  list.forEach(text => {
    const item = document.createElement("div");
    item.className = "template-item";
    item.innerText = text;
    item.onclick = () => {
      document.getElementById("textInput").value = text;
      AppState.text = text;
      AppState.scrollOffset = -AppState.GRID_COLS;
      Renderer.refresh();
    };
    container.appendChild(item);
  });
}
// 弹窗绑定
const modal = document.getElementById("settingModal");
const openBtn = document.getElementById("openSettingBtn");
const closeBtn = document.getElementById("closeSettingBtn");
const select = document.getElementById("regionSelect");
if(openBtn && modal) openBtn.onclick = () => modal.classList.add("open");
if(closeBtn && modal) closeBtn.onclick = () => modal.classList.remove("open");
if(select){
  select.value = currentRegion;
  select.onchange = e => setRegion(e.target.value);
}
setRegion(currentRegion);
