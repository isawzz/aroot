<?php
$myarea = $_POST['myarea'];
echo "DB saved";
rename('../DB.yaml', '../DB_old.yaml');
file_put_contents('../DB.yaml', $myarea);
?>

<script>
alert('DB SAVE SUCCESSFULL!');
</script>

<?php header("Location: ../index.php"); ?>