<?php
  $myarea = $_POST['myarea'];
  echo "DB saved";
  rename('../DB.yaml','../DB_old.yaml');
	file_put_contents('../DB.yaml',$myarea);
?>

<?php header("Location: ../index.php"); ?>