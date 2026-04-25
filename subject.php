<?php include("config.php"); ?>

<?php
// DELETE
if(isset($_GET['delete'])){
    $codeM = $_GET['delete'];
    $conn->query("DELETE FROM matiere WHERE codeM='$codeM'");
}

// UPDATE
if(isset($_POST['update'])){
    $codeM = $_POST['codeM'];
    $nomM = $_POST['nomM'];
    $coef = $_POST['coef'];
    $annee = $_POST['anneeM'];
    $filiere = $_POST['filiere'];

    $conn->query("UPDATE matiere 
        SET nomM='$nomM', coefficient='$coef', anneeM='$annee', filiere='$filiere'
        WHERE codeM='$codeM'");
}

// INSERT
if(isset($_POST['save'])){
    $codeM = $_POST['codeM'];
    $nomM = $_POST['nomM'];
    $coef = $_POST['coef'];
    $annee = $_POST['anneeM'];
    $filiere = $_POST['filiere'];

    $conn->query("INSERT INTO matiere(codeM, nomM, coefficient, anneeM, filiere)
        VALUES('$codeM','$nomM','$coef','$annee','$filiere')");
}

// EDIT MODE
$edit = false;
if(isset($_GET['edit'])){
    $edit = true;
    $codeM = $_GET['edit'];
    $result = $conn->query("SELECT * FROM matiere WHERE codeM='$codeM'");
    $row = $result->fetch_assoc();
}
?>

<!DOCTYPE html>
<html>
<head>
<title>Subject Management</title>

<style>
:root {
  --primary: #035772;
  --bg: #f6f9f5;
  --card: #ffffff;
}

body {
  font-family: Arial;
  background: var(--bg);
  padding: 20px;
}

h1 {
  color: var(--primary);
}

form {
  background: var(--card);
  padding: 15px;
  border-radius: 12px;
}

input, select {
  margin: 5px;
  padding: 8px;
}

button {
  background: var(--primary);
  color: white;
  padding: 8px;
  border: none;
}

table {
  width: 100%;
  margin-top: 20px;
  border-collapse: collapse;
  background: white;
}

th {
  background: var(--primary);
  color: white;
  padding: 10px;
}

td {
  padding: 10px;
  text-align: center;
}
</style>

</head>
<body>

<h1>Subject Management</h1>

<!-- FORM -->
<form method="POST">

<input type="hidden" name="codeM" 
value="<?php echo $edit ? $row['codeM'] : ''; ?>">

<input type="text" name="codeM" placeholder="Code"
value="<?php echo $edit ? $row['codeM'] : ''; ?>" required>

<input type="text" name="nomM" placeholder="Subject Name"
value="<?php echo $edit ? $row['nomM'] : ''; ?>" required>

<input type="number" name="coef" placeholder="Coefficient"
value="<?php echo $edit ? $row['coefficient'] : ''; ?>">

<select name="anneeM">
<option>1st Year</option>
<option <?php if($edit && $row['anneeM']=="2nd Year") echo "selected"; ?>>2nd Year</option>
<option <?php if($edit && $row['anneeM']=="3rd Year") echo "selected"; ?>>3rd Year</option>
</select>

<input type="text" name="filiere" placeholder="Major"
value="<?php echo $edit ? $row['filiere'] : ''; ?>">

<?php if($edit){ ?>
<button type="submit" name="update">Update</button>
<?php } else { ?>
<button type="submit" name="save">Save</button>
<?php } ?>

</form>

<!-- TABLE -->
<table>
<tr>
<th>Code</th>
<th>Name</th>
<th>Coefficient</th>
<th>Year</th>
<th>Major</th>
<th>Actions</th>
</tr>

<?php
$result = $conn->query("SELECT * FROM matiere");

while($r = $result->fetch_assoc()){
?>
<tr>
<td><?php echo $r['codeM']; ?></td>
<td><?php echo $r['nomM']; ?></td>
<td><?php echo $r['coefficient']; ?></td>
<td><?php echo $r['anneeM']; ?></td>
<td><?php echo $r['filiere']; ?></td>

<td>
<a href="subject.php?edit=<?php echo $r['codeM']; ?>">✏️</a>
<a href="subject.php?delete=<?php echo $r['codeM']; ?>" onclick="return confirm('Delete?')">🗑</a>
</td>
</tr>
<?php } ?>

</table>

</body>
</html>