<?php include("config.php"); ?>

<?php
// DELETE
if(isset($_GET['delete'])){
    $code = $_GET['delete'];
    $conn->query("DELETE FROM eleve WHERE code=$code");
}

// UPDATE
if(isset($_POST['update'])){
    $code = $_POST['code'];
    $nom = $_POST['nom'];
    $prenom = $_POST['prenom'];
    $moyenne = $_POST['moyenne'];

    $conn->query("UPDATE eleve 
        SET nom='$nom', prenom='$prenom', moyenne='$moyenne'
        WHERE code=$code");
}

// INSERT
if(isset($_POST['save'])){
    $nom = $_POST['nom'];
    $prenom = $_POST['prenom'];
    $date = $_POST['date_nais'];
    $sexe = $_POST['sexe'];
    $annee = $_POST['annee'];
    $filiere = $_POST['filiere'];
    $moyenne = $_POST['moyenne'];

    $conn->query("INSERT INTO eleve(nom, prenom, date_nais, sexe, annee, filiere, moyenne)
        VALUES('$nom','$prenom','$date','$sexe','$annee','$filiere','$moyenne')");
}

// EDIT MODE
$edit = false;
if(isset($_GET['edit'])){
    $edit = true;
    $code = $_GET['edit'];
    $result = $conn->query("SELECT * FROM eleve WHERE code=$code");
    $row = $result->fetch_assoc();
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Student Management</title>
    <style>
    :root {
      --primary: #035772;
      --secondary: #a5c8d4;
      --bg: #f6f9f5;
      --accent: #abb56e;
      --text: #0b1f24;
      --card: #ffffff;
      --radius: 12px;
      --shadow: 0 10px 25px rgba(3, 87, 114, 0.1);
    }
    body {font-family: Arial;background: var(--bg);color: var(--text);padding: 20px; }
    h1 {
      color: var(--primary);
    }
    form { background: var(--card); padding: 15px; border-radius: var(--radius); box-shadow: var(--shadow); }
    form input, form select { margin: 5px; padding: 8px;border-radius: var(--radius); border: 1px solid #ccc; }
    button { background: var(--primary); color: white; padding: 8px 15px; border: none; border-radius: var(--radius);cursor: pointer;}
    table {width: 100%; margin-top: 20px;border-collapse: collapse;background: var(--card); border-radius: var(--radius); box-shadow: var(--shadow); overflow: hidden;}
    th { background: var(--primary); color: white; padding: 10px;}
    td {padding: 10px; text-align: center; border-bottom: 1px solid #ddd; }
    a { margin: 5px; text-decoration: none; font-size: 18px; }
    </style>
</head>

<body>

<h1>Student Management</h1>

<form method="POST">

<input type="hidden" name="code" 
value="<?php echo $edit ? $row['code'] : ''; ?>">

<input type="text" name="nom" placeholder="Last Name"
value="<?php echo $edit ? $row['nom'] : ''; ?>" required>

<input type="text" name="prenom" placeholder="First Name"
value="<?php echo $edit ? $row['prenom'] : ''; ?>" required>

<input type="date" name="date_nais"
value="<?php echo $edit ? $row['date_nais'] : ''; ?>">

<select name="sexe">
<option <?php if($edit && $row['sexe']=="Female") echo "selected"; ?>>Female</option>
<option <?php if($edit && $row['sexe']=="Male") echo "selected"; ?>>Male</option>
</select>

<input type="text" name="annee" placeholder="Year"
value="<?php echo $edit ? $row['annee'] : ''; ?>">

<input type="text" name="filiere" placeholder="Filiere"
value="<?php echo $edit ? $row['filiere'] : ''; ?>">

<input type="number" step="0.01" name="moyenne" placeholder="Average"
value="<?php echo $edit ? $row['moyenne'] : ''; ?>">

<?php if($edit){ ?>
<button type="submit" name="update">Update</button>
<?php } else { ?>
<button type="submit" name="save">Save</button>
<?php } ?>

</form>

<table>
<tr>
<th>Code</th>
<th>Nom</th>
<th>Prenom</th>
<th>Date</th>
<th>Sexe</th>
<th>Année</th>
<th>Filière</th>
<th>Moyenne</th>
<th>Actions</th>
</tr>
<?php
$result = $conn->query("SELECT * FROM eleve");