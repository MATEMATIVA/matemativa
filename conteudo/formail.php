<?php require "config.ini"; ?>
<?php

if (empty($nome)){
// HTML que aparecera o ERRO
echo "<html><head><title>Ocorreu Um ERRO !!!</title></head>";
echo "<body bgcolor=\"#ffffff\">";
echo "<br><br><br>";
echo "<center>� Necessario o Preenchimento do <b>Nome</b></center>";
echo "<br><br><center><a href=\"javascript:history.back(1)\">Volta</a></center>";
echo "</body></html>";
}
// Verifica o Campo E-mail T� preenchido
elseif (empty($email)){
// HTML que aparecera o ERRO
echo "<html><head><title>Ocorreu Um ERRO !!!</title></head>";
echo "<body bgcolor=\"#ffffff\">";
echo "<br><br><br>";
echo "<center>O E-mail n�o foi <b>Digitado</b></center>";
echo "<br><br><center><a href=\"javascript:history.back(1)\">Volta</a></center>";
echo "</body></html>";
}
// Verifoca Se o E-mail Contem @
elseif (!(strpos($email,"@")) OR strpos($email,"@") !=strrpos($email,"@")) {
// HTML que aparecera o ERRO
echo "<html><head><title>Ocorreu Um ERRO !!!</title></head>";
echo "<body bgcolor=\"#ffffff\">";
echo "<br><br><br>";
echo "<center>O E-mail <b>N�o</b> � <b>v�lido</b></center>";
echo "<br><br><center><a href=\"javascript:history.back(1)\">Volta</a></center>";
echo "</body></html>";
}
// Verifica se o Campo Est� Preenchido
elseif (empty($assunto)){
// HTML que aparecera o ERRO
echo "<html><head><title>Ocorreu Um ERRO !!!</title></head>";
echo "<body bgcolor=\"#ffffff\">";
echo "<br><br><br>";
echo "<center>Voc� <b>N�o</b> Digito Um <b>Assunto</b></center>";
echo "<br><br><center><a href=\"javascript:history.back(1)\">Volta</a></center>";
echo "</body></html>";
}
// Verifica se o Campo Mensagem t� preenchido
elseif (empty($mensagem)){
// HTML que aparecera o ERRO
echo "<html><head><title>Ocorreu Um ERRO !!!</title></head>";
echo "<body bgcolor=\"#ffffff\">";
echo "<br><br><br>";
echo "<center>Voc� <b>N�o</b> Digito Uma <b>Mensagem</b></center>";
echo "<br><br><center><a href=\"javascript:history.back(1)\">Volta</a></center>";
echo "</body></html>";
}
else{
// Comfirma o Envio Do E-mail
if ($certo== "1"){
// Fun��o de envio Do E-mail
mail("$emaildest","$assunto","Nome:$nome\n Email:$email\n Mensagem:$mensagem\n IP:$REMOTE_ADDR\n\n ...::: BY SK15 � :::...","From:$nome<$email>");
}
// HTML do redirecionameto e se n�o redirecionar aparece um link
echo "<html><head>";
echo "<meta http-equiv=\"refresh\" content=\"0;url=$redirecionar\">";
echo "<title>Redirecionado ...</title>";
echo "</head><body bgcolor=\"#ffffff\">";
echo "<a href=\"$redirecionar\" target=\"_top\">Volta Para O Site</a>";
echo "</body></html>";
}
?>