export class MiniMap {
  constructor({ width, height, onMapClick }) {
    this.width = width;
    this.height = height;
    this.map = this.initMap();
    this.onMapClick = onMapClick;
    this.initListeners();
  }

  initListeners() {
    this.map.onclick = (e) => {
      if (this.onMapClick) {
        this.onMapClick(e);
      }
      console.log(e.target.dataset);
    }
  }

  initMap() {
    const map = document.createElement('div');
    map.className = 'mini-map';
    for (let i = 0; i < this.height; i++) {
      const row = document.createElement('div');
      row.className = 'mini-map__row';
      for (let j = 0; j < this.width; j++) {
        const el = document.createElement('div');
        el.className = 'mini-map__item';
        el.dataset.i = i;
        el.dataset.j = j;
        row.appendChild(el);
      }
      map.appendChild(row);
    }

    document.body .appendChild(map);
    return map;
  }
}