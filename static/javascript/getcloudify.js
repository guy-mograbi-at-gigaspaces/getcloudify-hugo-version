
$().ready(function(){
    $.ajax({
        method: 'GET',
        url: '/versions.json',
        success:function( result ){
            var versionSelect = $('<select id="versionSelect"></select>');
            $('section.post').prepend(versionSelect);
            $.each(result, function(key, value) {
                versionSelect
                    .append($("<option></option>")
                        .attr("value",value.name)
                        .text(value.name));
            });

            versionSelect.change(function(){
                document.location = document.location.origin + '/' + versionSelect.val();
            });

            console.log(result);
        }
    })
});
