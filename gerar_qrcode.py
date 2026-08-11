"""
Gera o QR code final para a página do convite.

Uso:
    pip install qrcode[pil]
    python3 gerar_qrcode.py "https://SEU-LINK-REAL.vercel.app"

Gera o arquivo qrcode-final.png na mesma pasta.
"""
import sys
import qrcode
from qrcode.constants import ERROR_CORRECT_M


def gerar(url: str, saida: str = "qrcode-final.png"):
    qr = qrcode.QRCode(
        version=None,
        error_correction=ERROR_CORRECT_M,
        box_size=14,
        border=3,
    )
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#0d0e24", back_color="#f8f2e2")
    img.save(saida)
    print(f"QR code salvo em: {saida}  (aponta para {url})")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print('Uso: python3 gerar_qrcode.py "https://seu-link.vercel.app"')
        sys.exit(1)
    gerar(sys.argv[1])
