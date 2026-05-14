from django.urls import path

from . import views

app_name = "loja"

urlpatterns = [
    path("", views.home, name="home"),
    path("pagamento/", views.create_payment, name="create_payment"),
    path("pagamento/sucesso/", views.payment_success, name="payment_success"),
    path("pagamento/pendente/", views.payment_pending, name="payment_pending"),
    path("pagamento/falha/", views.payment_failure, name="payment_failure"),
]
