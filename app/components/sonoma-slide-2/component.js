import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['sonoma-slide', '-no-center'],
  tagName: 'section',
  attributeBindings:["data-title"],
  "data-title": 'Slide 2',

  cartodbtable: 'o_1_tmx1951_1980jja_ave_hst',
  cartocss: '{raster-opacity:1;}',

  didRender(){
    this.slideMapEl = this.$('#map2-1');
    Reveal.addEventListener('slidechanged', function( event ) {
      if (event.currentSlide.classList.contains('slide-map-2-1')) {
        this.initMap();
      } else if (this.slideMap) {
        this.removeMap();
      }
    }.bind(this));
  },

  initMap(){
    this.slideMapEl.addClass('-loading');
    const mapOptions = {
      zoomControl: false,
      scrollWheelZoom:false,
      center: [38.280957,-122.457728],
      zoom: 7,
      basemapSpec: {
        url: 'http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png',
        options: {
          maxZoom: 18
        }
      }
    };

    if (!this.slideMap){
      this.slideMap = L.map('map2-1', mapOptions);
      L.tileLayer(mapOptions.basemapSpec.url, mapOptions.basemapSpec.options).addTo(this.slideMap);
      L.control.zoom({ position: 'topright' }).addTo(this.slideMap);
      this.addRaster();
      this.addLabels();
      // if (this.bounds){
      //   this.fitBounds();
      // } else {
      //   this.setBounds().done(function(data){
      //     let coordinates = JSON.parse(data.rows[0].bbox).coordinates[0];
      //     let southWest = L.latLng(coordinates[0][1],coordinates[0][0]),
      //     northEast = L.latLng(coordinates[2][1],coordinates[2][0]);
      //     this.bounds = L.latLngBounds(southWest, northEast);
      //     this.fitBounds();
      //   }.bind(this));
      // }
    }
  },

  fitBounds: function(){
    this.slideMap.fitBounds(this.bounds);
    this.slideMap.setMaxBounds(this.bounds);
    this.slideMap.options.minZoom = this.slideMap.getZoom();
  },

  setBounds: function(){
    let query  = 'SELECT ST_AsGeoJSON(ST_Envelope(ST_Union(ST_Transform(ST_Envelope(the_raster_webmercator), 4326)))) as bbox FROM '+ this.cartodbtable +' as t';
    return $.get('https://prep-admin.cartodb.com/api/v2/sql/?q='+query);
  },

  addLabels(){
    var request = {
      layers: [{
        'user_name': 'prep-admin',
        'type': 'cartodb',
        'options': {
            'sql': 'SELECT the_geom_webmercator, initcap(name) as name FROM \"prep-admin\".ci08au12',
            'cartocss': '#ci08au12::labels {text-name: [name];text-face-name: \'Lato Regular\';text-size: 10;text-label-position-tolerance: 10;text-fill: #a3a1a0 ;text-halo-fill: #FFF;text-halo-radius: 0.2;text-dy: -10;text-allow-overlap: false;text-placement: point;text-placement-type: simple;}',
          'cartocss_version': '2.3.0',
        }
      }]
    };

    $.ajax({
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json; charset=UTF-8',
      url: 'https://prep-admin.cartodb.com/api/v1/map/',
      data: JSON.stringify(request),
      success: function(data) {
        var tileUrl = 'https://prep-admin.cartodb.com/api/v1/map/' + data.layergroupid + '/{z}/{x}/{y}.png';
        if (this.slideMap) {
          var labelsLayer = L.tileLayer(tileUrl).setZIndex(3).addTo(this.slideMap, 1);

          labelsLayer.on('load',function() {
            if(this.slideMapEl){
              this.slideMapEl.removeClass('-loading');
            }
          }.bind(this));
        }
      }.bind(this)
    });
  },

  addRaster(){
    this.slideMapEl.addClass('-loading');
    var request = {
      layers: [{
        'user_name': 'prep-admin',
        'type': 'cartodb',
        'options': {
            'sql': 'with xr as (SELECT the_geom_webmercator FROM \"prep-admin\".cb_2015_06_tract_500k_copy) select ST_clip(the_raster_webmercator,1,the_geom_webmercator, 1) the_raster_webmercator from \"prep-admin\".'+this.cartodbtable+', xr  where st_intersects(the_geom_webmercator, the_raster_webmercator)',
            'cartocss': '#'+this.cartodbtable+this.cartocss,
          'cartocss_version': '2.3.0',
          'geom_column': 'the_raster_webmercator',
          'geom_type': 'raster',
          'raster_band': 1
        }
      }]
    };

    $.ajax({
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json; charset=UTF-8',
      url: 'https://prep-admin.cartodb.com/api/v1/map/',
      data: JSON.stringify(request),
      success: function(data) {
        var tileUrl = 'https://prep-admin.cartodb.com/api/v1/map/' + data.layergroupid + '/{z}/{x}/{y}.png';
        if (this.slideMap) {
          if (this.layer) {
            this.slideMap.removeLayer(this.layer);
            this.layer = null;
          }
          this.layer = L.tileLayer(tileUrl).addTo(this.slideMap, 1);
          this.layer.on('load',function() {
            if(this.slideMapEl){
              this.slideMapEl.removeClass('-loading');
            }
          }.bind(this));
        }
      }.bind(this)
    });
  },

  removeMap(){
    this.slideMap.remove();
    this.slideMap = null;
  }
});