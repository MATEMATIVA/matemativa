<?

//Pega o valor do campo nome do formulário:
$nome = htmlspecialchars(trim($_POST['nome']));

//Pega o valor do campo assunto do formulário:
$assunto = htmlspecialchars(trim($_POST['assunto']));
$assunto = "SITE MATEMATIVA: $assunto";

//Pega o valor do campo email do formulário:
$email = htmlspecialchars(trim($_POST['email']));

//Coloque o e-mail que receberá os dados:
$para = "jrgeronimo@uem.br";

//Pega o valor do campo mensagem, e usa a função n12br() para aceitar comandos html:
$mensagem = nl2br($_POST['mensagem']);

//Pega o horario que foi enviado o email:
$data = date("H:i");

//Cria o texto que será enviado ao e-mail
$conteudo = "
<b>Nome:</b> $nome<br>
<b>E-mail:</b> $email<br>
<b>Horário:</b> $data<br>
<b>Assunto:</b> $assunto<br>
<b>Mensagem:</b> $mensagem
";

//$headers =  "Content-Type:text/html; charset=UTF-8\r\n";
//$headers .= "From: $email \r\n";
//$headers .= "MIME-Version: 1.0\r\n";
 

$headers = "MIME-Version: 1.0\r\n";
$headers .= "Content-type: text/html; charset=iso-8859-1\r\n";
$headers .= "From: $email \r\n";

//Enviar os dados do formulário para seu e-mail
$enviar = mail($para, $assunto, $conteudo, $headers);

//Verifica se o e-mail foi entregue com sucesso 
if($enviar) {
//echo "E-mail enviado com sucesso!";
echo "<html><body><SCRIPT LANGUAGE=\"JavaScript\">window.alert(\"E-mail enviado com sucesso!\")</SCRIPT></body></html>";
echo '<meta http-equiv="refresh" content="1;url=./contato.html">';
}else{
echo "<html><body><SCRIPT LANGUAGE=\"JavaScript\">window.alert(\"Nao foi possivel enviar o email\")</SCRIPT></body></html>";
echo '<meta http-equiv="refresh" content="1;url=./contato.html">';
}

?> 