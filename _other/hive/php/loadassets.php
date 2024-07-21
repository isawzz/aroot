<?php
  $allSyms = file_get_contents('../base/assets/allSyms.yaml'); 
  $symGSG = file_get_contents('../base/assets/symGSG.yaml'); 
  $c52 = file_get_contents('../base/assets/c52.yaml'); 
?>
<script type="text/javascript">
let x = <?=json_encode($allSyms);?>;
Syms = symbolDict = jsyaml.load(x);
SymKeys = Object.keys(Syms);
x = <?=json_encode($symGSG);?>;
ByGroupSubgroup = jsyaml.load(x);
x = <?=json_encode($c52);?>;
C52 = jsyaml.load(x);
</script>