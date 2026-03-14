namespace EcommerceApi.Jobs;

public sealed class SendEmailJob(ILogger<SendEmailJob> logger)
{
    /// <summary>
    /// Envia e-mail de confirmação de pedido.
    /// Chamado em background via Hangfire após pagamento confirmado.
    /// </summary>
    public async Task ExecuteAsync(string to, string subject, string body, CancellationToken ct)
    {
        // TODO: Integrar com provedor de e-mail (SendGrid, Amazon SES, etc.)
        logger.LogInformation("Enviando e-mail para {To}: {Subject}", to, subject);

        await Task.CompletedTask;

        logger.LogInformation("E-mail enviado para {To}", to);
    }
}
