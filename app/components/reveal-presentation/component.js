import Ember from 'ember';

export default Ember.Component.extend({
  classNames: 'reveal-container',
  actions: {
    openModal: function(modal){
      console.log(`TODO: open ${modal} modal`);
    }
  },
  didInsertElement: function() {
    Reveal.initialize({
      controls: false,
      progress: false,
      slideNumber: true,
      history: false,
      keyboard: true,
      overview: true,
      center: true,
      touch: true,
      loop: false,
      hideAddressBar: true, // Hides the address bar on mobile devices
      transition: 'slide', // none/fade/slide/convex/concave/zoom
      transitionSpeed: 'default', // default/fast/slow
    });
    // Slide number formatting can be configured using these variables:
    //  "h.v":  horizontal . vertical slide number (default)
    //  "h/v":  horizontal / vertical slide number
    //    "c":  flattened slide number
    //  "c/t":  flattened slide number / total slides
    Reveal.configure({ slideNumber: 'c/t' });
  }
});
