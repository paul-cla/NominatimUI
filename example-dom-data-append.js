var objs = [
  { id: 1, value: "One", type: "number" },
  { id: 2, value: "Two", type: "number" },
  { id: 3, value: "Three", type: "number" },
  { id: "A", value: "A", type: "char" },
  { id: "B", value: "B", type: "char" },
  { id: "C", value: "C", type: "char" },
  ];

var options = $.map(objs, function(item, idx) {
  var opt = $("<option/>").val(item.id).text(item.value).data('obj', item.type);
  return opt;
});
             
$.fn.append.apply($("#select"), options)
  .change(function() {
    $("#select option:selected")
      .each(function(){
        alert($(this).data('obj'));
      });
  });

